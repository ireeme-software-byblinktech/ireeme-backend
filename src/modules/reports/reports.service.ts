import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../database/prisma.service';
import { QUEUE_REPORTS } from '../../queues/queues.module';
import { AttendanceStatus } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(QUEUE_REPORTS) private readonly reportsQueue: Queue,
  ) { }

  async aggregateForStudent(studentId: string, termId: string, schoolId: string) {
    const term = await this.prisma.academicTerm.findFirst({
      where: { id: termId, schoolId },
      select: { startDate: true, endDate: true }
    })
    if (!term) throw new NotFoundException('Term not found');

    // 1. Fetch all Grade records for student + term + schoolId
    const grades = await this.prisma.grade.findMany({
      where: { studentId, termId, schoolId },
      include: {
        subject: { select: { id: true, name: true, code: true } },
      },
      orderBy: { subject: { name: 'asc' } },
    });

    // 2. Calculate GPA: sum of (score / maxScore * 100) / total subjects
    const gpa = grades.length
      ? Math.round(
        (grades.reduce((sum, g) => sum + (Number(g.score) / Number(g.maxScore)) * 100, 0) /
          grades.length) *
        100,
      ) / 100
      : 0;

    // 3. Fetch attendance summary per subject for the term
    const attendanceRecords = await this.prisma.attendanceRecord.findMany({
      where: {
        studentId,
        schoolId,
        // Filter by term date range
        date: {
          gte: term?.startDate ?? new Date(0),
          lte: term?.endDate ?? new Date,
        },
      },
      select: {
        subjectId: true,
        status: true,
      },
    });

    // Group attendance by subject
    const attendanceBySubject = attendanceRecords.reduce(
      (acc, record) => {
        if (!acc[record.subjectId]) {
          acc[record.subjectId] = {
            subjectId: record.subjectId,
            present: 0,
            absent: 0,
            late: 0,
            excused: 0,
            percentage: 0,
          };
        }
        const status = record.status.toLowerCase();
        switch (record.status) {
          case AttendanceStatus.PRESENT:
            acc[record.subjectId].present++;
            break;
          case AttendanceStatus.ABSENT:
            acc[record.subjectId].absent++;
            break;
          case AttendanceStatus.LATE:
            acc[record.subjectId].late++;
            break;
          case AttendanceStatus.EXCUSED:
            acc[record.subjectId].excused++;
            break;
        }
        return acc;
      },
      {} as Record<
        string,
        {
          subjectId: string;
          present: number;
          absent: number;
          late: number;
          excused: number;
          percentage: number;
        }
      >,
    );

    // Calculate attendance percentage per subject
    const attendanceSummary = Object.values(attendanceBySubject).map((summary) => {
      const total = summary.present + summary.absent + summary.late + summary.excused;
      summary.percentage =
        total > 0 ? Math.round(((summary.present + summary.late) / total) * 100) : 0;
      return summary;
    });

    // 4. Return combined object
    return {
      studentId,
      termId,
      gpa,
      grades,
      attendanceSummary,
    };
  }

  async getReportCard(studentId: string, termId: string, schoolId: string) {
    const [student, studentUser, term] = await Promise.all([
      this.prisma.student.findFirst({
        where: { id: studentId, schoolId },
      }),
      this.prisma.user.findFirst({
        where: { student: { id: studentId } },
        select: { firstName: true, lastName: true, email: true, avatarUrl: true },
      }),
      this.prisma.academicTerm.findFirst({
        where: { id: termId, schoolId },
      }),
    ]);

    if (!student) throw new NotFoundException('Student not found');
    if (!term) throw new NotFoundException('Term not found');

    // Use aggregateForStudent to get the data
    const aggregatedData = await this.aggregateForStudent(studentId, termId, schoolId);

    const reportCard = {
      student: {
        id: student.id,
        name: `${studentUser?.firstName ?? ''} ${studentUser?.lastName ?? ''}`.trim(),
        email: studentUser?.email ?? null,
        avatarUrl: studentUser?.avatarUrl ?? null,
      },
      term: { id: term.id, name: term.name, startDate: term.startDate, endDate: term.endDate },
      attendance: {
        
      },
      grades: aggregatedData.grades.map((g) => ({
        subject: g.subject.name,
        subjectCode: g.subject.code,
        score: Number(g.score),
        maxScore: Number(g.maxScore),
        percentage: Math.round((Number(g.score) / Number(g.maxScore)) * 100),
        feedback: g.feedback,
        gradedAt: g.gradedAt,
      })),
      gpa: aggregatedData.gpa,
      attendanceSummary: aggregatedData.attendanceSummary,
    };

    // Queue PDF generation job
    await this.reportsQueue.add(
      'generate-report-card',
      {
        studentId,
        termId,
        schoolId,
        requestedAt: new Date().toISOString(),
      },
      { attempts: 3, priority: 2 },
    );

    return reportCard;
  }

}
