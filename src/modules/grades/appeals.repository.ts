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

  updateStatus(id: string, schoolId: string, status: AppealStatus) {
    return this.prisma.gradeAppeal.updateMany({
      where: { id,schoolId },
      data: { status },
    });
  }
}
