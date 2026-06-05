import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { BaseRepository } from '../../database/base.repository';
import { AppealStatus } from '@prisma/client';

@Injectable()
export class AppealsRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  create(data: {
    gradeId: string;
    studentId: string;
    schoolId: string;
    reason: string;
  }) {
    return this.prisma.gradeAppeal.create({
      data: {
        ...data,
        status: AppealStatus.PENDING,
      },
    });
  }

  findById(id: string, schoolId: string) {
    return this.prisma.gradeAppeal.findFirst({
      where: this.scopeToSchool(schoolId, { id }),
      include: {
        grade: {
          include: {
            subject: { select: { name: true, code: true } },
            student: {
              include: {
                user: { select: { firstName: true, lastName: true, email: true } },
              },
            },
          },
        },
      },
    });
  }

  findByGradeId(gradeId: string, schoolId: string) {
    return this.prisma.gradeAppeal.findFirst({
      where: this.scopeToSchool(schoolId, { gradeId }),
    });
  }

  findAll(schoolId: string, page = 1, limit = 50) {
    const maxLimit = Math.min(limit, 50);
    return this.prisma.gradeAppeal.findMany({
      where: this.scopeToSchool(schoolId),
      include: {
        grade: {
          include: {
            subject: { select: { name: true, code: true } },
          },
        },
        student: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * maxLimit,
      take: maxLimit,
    });
  }

  async findAllByTeacher(schoolId: string, teacherUserId: string, page = 1, limit = 50) {
    const maxLimit = Math.min(limit, 50);

    // Get teacher record
    const teacher = await this.prisma.teacher.findFirst({
      where: { schoolId, userId: teacherUserId },
      select: { id: true },
    });

    if (!teacher) return [];

    // Get all classes taught by this teacher
    const classIds = await this.prisma.timetableSlot.findMany({
      where: {
        schoolId,
        teacherId: teacher.id,
      },
      select: { classId: true },
      distinct: ['classId'],
    });

    // Get all students in those classes
    const studentIds = await this.prisma.classStudent.findMany({
      where: {
        schoolId,
        classId: {
          in: classIds.map((c) => c.classId),
        },
      },
      select: { studentId: true },
    });

    // Get appeals for those students
    return this.prisma.gradeAppeal.findMany({
      where: this.scopeToSchool(schoolId, {
        studentId: {
          in: studentIds.map((s) => s.studentId),
        },
      }),
      include: {
        grade: {
          include: {
            subject: { select: { name: true, code: true } },
          },
        },
        student: {
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * maxLimit,
      take: maxLimit,
    });
  }

  updateStatus(id: string, schoolId: string, status: AppealStatus) {
    return this.prisma.gradeAppeal.updateMany({
      where: { id,schoolId },
      data: { status },
    });
  }
}
