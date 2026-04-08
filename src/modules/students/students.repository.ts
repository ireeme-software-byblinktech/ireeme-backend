import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { BaseRepository } from '../../database/base.repository';
import { QueryStudentDto } from './dto/query-student.dto';

@Injectable()
export class StudentsRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findAll(schoolId: string, query: QueryStudentDto) {
    const { page = 1, limit = 25, classId, search, isActive } = query;

    const where = this.scopeToSchool(schoolId, {
      ...(classId && { classId }),
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        user: {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' as const } },
            { lastName: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        },
      }),
    });

    const [data, total] = await Promise.all([
      this.prisma.student.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { firstName: true, lastName: true, email: true, avatarUrl: true } },
          classes: { select: { class: { select: { name: true } } } },
        },
        orderBy: { user: { lastName: 'asc' } },
      }),
      this.prisma.student.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  findById(id: string, schoolId: string) {
    return this.prisma.student.findFirst({
      where: this.scopeToSchool(schoolId, { id }),
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
            lastLoginAt: true,
          },
        },
        classes: { include: { class: true } },
        parentLinks: {
          include: {
            parent: {
              include: { user: { select: { firstName: true, lastName: true, email: true } } },
            },
          },
        },
      },
    });
  }

  findByUserId(userId: string, schoolId: string) {
    return this.prisma.student.findFirst({
      where: this.scopeToSchool(schoolId, { userId }),
    });
  }

  create(data: {
    userId: string;
    schoolId: string;
    studentNumber: string;
    dateOfBirth?: Date;
    gender?: string;
  }) {
    return this.prisma.student.create({
      data,
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
    });
  }

  update(
    id: string,
    schoolId: string,
    data: Partial<{
      dateOfBirth: Date;
      gender: string;
      isActive: boolean;
      studentNumber: string;
    }>,
  ) {
    return this.prisma.student.update({
      where: { id },
      data,
    });
  }

  // Dashboard aggregation — cached by service layer
  async getDashboardData(studentId: string, schoolId: string) {
    const [grades, attendance, assignments, notifications] = await Promise.all([
      this.prisma.grade.findMany({
        where: this.scopeToSchool(schoolId, { studentId }),
        orderBy: { gradedAt: 'desc' },
        take: 5,
        include: { subject: { select: { name: true } } },
      }),
      this.prisma.attendanceRecord.groupBy({
        by: ['status'],
        where: this.scopeToSchool(schoolId, { studentId }),
        _count: { status: true },
      }),
      this.prisma.assignment.findMany({
        where: {
          schoolId,
          dueAt: { gte: new Date() },
          subjectId: {
            in: (
              await this.prisma.subject.findMany({
                where: {
                  schoolId,
                  classId: (
                    await this.prisma.classStudent.findFirst({
                      where: { studentId },
                      select: { classId: true },
                      orderBy: { enrolledAt: 'desc' },
                    })
                  )?.classId ?? undefined,
                },
                select: { id: true },
              })
            ).map((s) => s.id),
          },
        },
        orderBy: { dueAt: 'asc' },
        take: 5,
        select: {
          id: true,
          title: true,
          dueAt: true,
          type: true,
          subject: { select: { name: true } },
        },
      }),
      this.prisma.notification.count({
        where: {
          userId:
            (
              await this.prisma.student.findUnique({
                where: { id: studentId },
                select: { userId: true },
              })
            )?.userId ?? '',
          isRead: false,
        },
      }),
    ]);

    return { grades, attendance, assignments, unreadNotifications: notifications };
  }
}
