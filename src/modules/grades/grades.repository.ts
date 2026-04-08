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
      update: {
        score: data.score,
        feedback: data.feedback,
        gradedAt: new Date(),
        teacherId: data.teacherId,
      },
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

  findById(id: string, schoolId: string) {
    return this.prisma.grade.findFirst({
      where: { id, schoolId },
      include: {
        submission: { include: { assignment: true } },
        student: { include: { user: true } },
      },
    });
  }

  updateAppeal(id: string, schoolId: string, appealStatus: any) {
    return this.prisma.grade.updateMany({
      where: { id, schoolId },
      data: { appealStatus },
    });
  }

  updateSubmissionStatus(submissionId: string, schoolId: string, status: any) {
    return this.prisma.submission.updateMany({
      where: { id: submissionId, schoolId },
      data: { status },
    });
  }
}
