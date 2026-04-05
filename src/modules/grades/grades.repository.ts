import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { BaseRepository } from '../../database/base.repository';

@Injectable()
export class GradesRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  gradeSubmission(data: {
    schoolId: string;
    submissionId: string;
    studentId: string;
    subjectId: string;
    teacherId: string;
    termId: string;
    score: number;
    maxScore: number;
    feedback?: string;
  }) {
    return this.prisma.grade.upsert({
      where: { submissionId: data.submissionId },
      create: data,
      update: { score: data.score, feedback: data.feedback, gradedAt: new Date() },
    });
  }

  findByStudentTerm(studentId: string, termId: string, schoolId: string, page = 1, limit = 50) {
    return this.prisma.grade.findMany({
      where: this.scopeToSchool(schoolId, { studentId, termId }),
      include: {
        subject: { select: { name: true, code: true } },
        submission: { select: { assignmentId: true } },
      },
      orderBy: { gradedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  findById(id: string) {
    return this.prisma.grade.findUnique({ where: { id } });
  }

  updateAppeal(id: string, appealStatus: any) {
    return this.prisma.grade.update({ where: { id }, data: { appealStatus } });
  }

  updateSubmissionStatus(submissionId: string, status: any) {
    return this.prisma.submission.update({ where: { id: submissionId }, data: { status } });
  }
}
