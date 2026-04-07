import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { BaseRepository } from '../../database/base.repository';
import { SubmissionStatus } from '@prisma/client';

export interface SubmissionInsertData {
  assignmentId: string;
  studentId: string;
  schoolId: string;
  fileUrls: string[];
  content?: string;
  isLate: boolean;
}

@Injectable()
export class SubmissionsRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  upsert(data: SubmissionInsertData) {
    const status: SubmissionStatus = data.isLate ? 'LATE' : 'SUBMITTED';
    return this.prisma.submission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId: data.assignmentId,
          studentId: data.studentId,
        },
      },
      create: {
        assignmentId: data.assignmentId,
        studentId: data.studentId,
        schoolId: data.schoolId,
        fileUrls: data.fileUrls,
        content: data.content,
        isLate: data.isLate,
        status,
      },
      update: {
        fileUrls: data.fileUrls,
        content: data.content,
        isLate: data.isLate,
        status,
        submittedAt: new Date(),
      },
    });
  }

  findById(id: string) {
    return this.prisma.submission.findUnique({
      where: { id },
      include: { assignment: true, student: { include: { user: true } } },
    });
  }

  findStudentByUser(userId: string) {
    return this.prisma.student.findUnique({ where: { userId } });
  }
}
