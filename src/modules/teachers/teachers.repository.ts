import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { BaseRepository } from '../../database/base.repository';

@Injectable()
export class TeachersRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findAll(schoolId: string, page = 1, limit = 25) {
    const where = this.scopeToSchool(schoolId);
    return this.prisma.teacher.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { firstName: true, lastName: true, email: true, avatarUrl: true } },
      },
    });
  }

  findById(id: string, schoolId: string) {
    return this.prisma.teacher.findFirst({
      where: this.scopeToSchool(schoolId, { id }),
      include: {
        user: { select: { firstName: true, lastName: true, email: true, avatarUrl: true } },
        subjects: { include: { subject: { select: { name: true, code: true } } } },
      },
    });
  }

  create(data: {
    userId: string;
    schoolId: string;
    employeeNum: string;
    department?: string;
    qualification?: string;
    joiningDate?: Date;
  }) {
    return this.prisma.teacher.create({
      data,
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
    });
  }

  update(
    id: string,
    data: Partial<{
      employeeNum: string;
      department: string;
      qualification: string;
      isActive: boolean;
    }>,
  ) {
    return this.prisma.teacher.update({ where: { id }, data });
  }

  assignSubject(teacherId: string, subjectId: string, schoolId: string) {
    return this.prisma.teacherSubject.upsert({
      where: { teacherId_subjectId: { teacherId, subjectId } },
      create: { teacherId, subjectId, schoolId },
      update: {},
    });
  }

  removeSubject(teacherId: string, subjectId: string) {
    return this.prisma.teacherSubject.delete({
      where: { teacherId_subjectId: { teacherId, subjectId } },
    });
  }
}
