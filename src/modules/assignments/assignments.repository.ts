import { Injectable } from '@nestjs/common';
import { AssignmentType } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { BaseRepository } from '../../database/base.repository';

@Injectable()
export class AssignmentsRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findAll(schoolId: string, filters: { subjectId?: string; teacherUserId?: string } = {}) {
    // If teacherUserId is provided, we need to get the teacher record ID first
    let where: any = this.scopeToSchool(schoolId, {});
    
    if (filters.subjectId) {
      where.subjectId = filters.subjectId;
    }
    
    if (filters.teacherUserId) {
      // Get the teacher record by user ID
      const teacher = await this.prisma.teacher.findFirst({
        where: { userId: filters.teacherUserId, schoolId },
        select: { id: true },
      });
      
      if (teacher) {
        where.teacherId = teacher.id;
      } else {
        // If teacher not found, return empty array
        return [];
      }
    }
    
    return this.prisma.assignment.findMany({
      where,
      include: { 
        subject: { select: { name: true } },
        submissions: { select: { id: true, studentId: true, status: true, submittedAt: true } }
      },
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
    type: AssignmentType;
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

  delete(id: string) {
    return this.prisma.assignment.delete({ where: { id } });
  }

  upsertSubmission(assignmentId: string, studentId: string,schoolId:string, fileUrls: string[], isLate: boolean) {
    return this.prisma.submission.upsert({
      where: { assignmentId_studentId: { assignmentId, studentId } },
      create: { assignmentId, studentId,schoolId, fileUrls, isLate, status: isLate ? 'LATE' : 'SUBMITTED' },
      update: { fileUrls, isLate, status: isLate ? 'LATE' : 'SUBMITTED', submittedAt: new Date() },
    });
  }

  findSubmission(id: string) {
    return this.prisma.submission.findUnique({ where: { id }, include: { assignment: true } });
  }
}
