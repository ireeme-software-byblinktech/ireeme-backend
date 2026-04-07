import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../database/prisma.service';
import { QUEUE_REPORTS } from '../../queues/queues.module';

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(QUEUE_REPORTS) private readonly reportsQueue: Queue,
  ) {}

  async getReportCard(studentId: string, termId: string, schoolId: string) {
    const [student, studentUser, grades, attendance, term] = await Promise.all([
      this.prisma.student.findFirst({
        where: { id: studentId, schoolId },
      }),
      this.prisma.user.findFirst({
        where: { student: { id: studentId } },
        select: { firstName: true, lastName: true, email: true, avatarUrl: true },
      }),
      this.prisma.grade.findMany({
        where: { studentId, termId, schoolId },
        include: { subject: { select: { name: true, code: true } } },
        orderBy: { subject: { name: 'asc' } },
      }),
      this.prisma.attendanceRecord.groupBy({
        by: ['status'],
        where: { studentId, schoolId },
        _count: { status: true },
      }),
      this.prisma.academicTerm.findFirst({
        where: { id: termId, schoolId },
      }),
    ]);

    if (!student) throw new NotFoundException('Student not found');
    if (!term) throw new NotFoundException('Term not found');

    // Calculate GPA
    const gpa = grades.length
      ? Math.round(
          (grades.reduce((sum, g) => sum + (Number(g.score) / Number(g.maxScore)) * 100, 0) /
            grades.length) *
            100,
        ) / 100
      : 0;

    // Attendance summary
    const attendanceSummary = attendance.reduce(
      (acc, r) => ({ ...acc, [r.status]: r._count.status }),
      {} as Record<string, number>,
    );
    const totalDays = Object.values(attendanceSummary).reduce((a, b) => a + b, 0);
    const presentDays = (attendanceSummary['PRESENT'] ?? 0) + (attendanceSummary['LATE'] ?? 0);
    const attendancePercent = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    const reportCard = {
      student: {
        id: student.id,
        name: `${studentUser?.firstName ?? ''} ${studentUser?.lastName ?? ''}`.trim(),
        email: studentUser?.email ?? null,
        avatarUrl: studentUser?.avatarUrl ?? null,
      },
      term: { id: term.id, name: term.name, startDate: term.startDate, endDate: term.endDate },
      grades: grades.map((g) => ({
        subject: g.subject.name,
        subjectCode: g.subject.code,
        score: Number(g.score),
        maxScore: Number(g.maxScore),
        percentage: Math.round((Number(g.score) / Number(g.maxScore)) * 100),
        feedback: g.feedback,
        gradedAt: g.gradedAt,
      })),
      gpa,
      attendance: { ...attendanceSummary, totalDays, presentDays, attendancePercent },
    };

    // Queue PDF generation (Sprint 2 — stub)
    await this.reportsQueue.add(
      'generate-pdf',
      { studentId, termId, schoolId },
      { attempts: 3, priority: 2 },
    );

    return reportCard;
  }
}
