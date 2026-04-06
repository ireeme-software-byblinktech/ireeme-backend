import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { BaseRepository } from '../../database/base.repository';

@Injectable()
export class AssignmentsRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findAll(schoolId: string, filters: { subjectId?: string; teacherId?: string } = {}) {
    return this.prisma.assignment.findMany({
      where: this.scopeToSchool(schoolId, filters),
      include: { subject: { select: { name: true } } },
      orderBy: { dueAt: 'asc' },
    });
  }

  findById(id: string, schoolId: string) {
    return this.prisma.assignment.findFirst({
      where: this.scopeToSchool(schoolId, { id }),
      include: {
        subject: true,
        submissions: { select: { id: true, studentId: true, status: true, submittedAt: true } },
      },
    });
  }

  create(data: {
    schoolId: string;
    subjectId: string;
    teacherId: string;
    title: string;
    description?: string;
    type: any;
    maxScore: number;
    weight: number;
    dueAt: Date;
    allowLate?: boolean;
    fileUrls?: string[];
  }) {
    return this.prisma.assignment.create({ data });
  }

  update(
    id: string,
    data: Partial<{
      title: string;
      description: string;
      dueAt: Date;
      maxScore: number;
      allowLate: boolean;
    }>,
  ) {
    return this.prisma.assignment.update({ where: { id }, data });
  }

  upsertSubmission(assignmentId: string, studentId: string, fileUrls: string[], isLate: boolean) {
    return this.prisma.submission.upsert({
      where: { assignmentId_studentId: { assignmentId, studentId } },
      create: { assignmentId, studentId, fileUrls, isLate, status: isLate ? 'LATE' : 'SUBMITTED' },
      update: { fileUrls, isLate, status: isLate ? 'LATE' : 'SUBMITTED', submittedAt: new Date() },
    });
  }

  findSubmission(id: string) {
    return this.prisma.submission.findUnique({ where: { id }, include: { assignment: true } });
  }
}
