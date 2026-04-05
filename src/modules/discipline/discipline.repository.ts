import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { BaseRepository } from '../../database/base.repository';
import { CaseStatus } from '@prisma/client';

@Injectable()
export class DisciplineRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  // ── Offense types ──────────────────────────────────────────────────────────

  findAllOffenseTypes(schoolId: string) {
    return this.prisma.offenseType.findMany({ where: { schoolId } });
  }

  createOffenseType(data: { schoolId: string; name: string; pointDeduction: number }) {
    return this.prisma.offenseType.create({ data });
  }

  // ── Cases ──────────────────────────────────────────────────────────────────

  async findAll(
    schoolId: string,
    page: number,
    limit: number,
    studentId?: string,
    status?: CaseStatus,
  ) {
    const where = this.scopeToSchool(schoolId, {
      ...(studentId && { studentId }),
      ...(status && { status }),
    });
    const [data, total] = await Promise.all([
      this.prisma.disciplineCase.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          student: { include: { user: { select: { firstName: true, lastName: true } } } },
          offenseType: { select: { name: true, pointDeduction: true } },
          appeal: true,
        },
      }),
      this.prisma.disciplineCase.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  findById(id: string, schoolId: string) {
    return this.prisma.disciplineCase.findFirst({
      where: this.scopeToSchool(schoolId, { id }),
      include: {
        student: { include: { user: { select: { firstName: true, lastName: true } } } },
        offenseType: true,
        officer: { select: { firstName: true, lastName: true } },
        appeal: true,
      },
    });
  }

  create(data: {
    schoolId: string;
    studentId: string;
    officerId: string;
    offenseTypeId: string;
    description: string;
    pointsDeduct: number;
    evidenceUrls?: string[];
  }) {
    return this.prisma.disciplineCase.create({
      data: { ...data, evidenceUrls: data.evidenceUrls ?? [] },
      include: { offenseType: true },
    });
  }

  updateStatus(id: string, status: CaseStatus) {
    return this.prisma.disciplineCase.update({ where: { id }, data: { status } });
  }

  // ── Appeals ────────────────────────────────────────────────────────────────

  createAppeal(caseId: string, reason: string) {
    return this.prisma.disciplineAppeal.create({ data: { caseId, reason } });
  }

  findAppeal(caseId: string) {
    return this.prisma.disciplineAppeal.findUnique({ where: { caseId } });
  }

  updateAppeal(caseId: string, status: 'APPROVED' | 'REJECTED') {
    return this.prisma.disciplineAppeal.update({ where: { caseId }, data: { status } });
  }
}
