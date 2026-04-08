import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { BaseRepository } from '../../database/base.repository';
import { AttendanceStatus } from '@prisma/client';

@Injectable()
export class AttendanceRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async bulkUpsert(
    schoolId: string,
    subjectId: string,
    date: Date,
    markedById: string,
    records: Array<{ studentId: string; status: AttendanceStatus; note?: string }>,
  ) {
    const ops = records.map((r) =>
      this.prisma.attendanceRecord.upsert({
        where: { studentId_subjectId_date: { studentId: r.studentId, subjectId, date } },
        create: {
          schoolId,
          studentId: r.studentId,
          subjectId,
          date,
          status: r.status,
          markedById,
          note: r.note,
        },
        update: { status: r.status, markedById, note: r.note },
      }),
    );
    return Promise.all(ops);
  }

  findByStudent(studentId: string, schoolId: string, page = 1, limit = 25, subjectId?: string) {
    const where = this.scopeToSchool(schoolId, {
      studentId,
      ...(subjectId ? { subjectId } : {}),
    });
    return this.prisma.attendanceRecord.findMany({
      where,
      orderBy: { date: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { subject: { select: { name: true, code: true } } },
    });
  }

  async calculateSummary(studentId: string, schoolId: string, fromDate: Date, toDate: Date) {
    const records = await this.prisma.attendanceRecord.findMany({
      where: this.scopeToSchool(schoolId, {
        studentId,
        date: { gte: fromDate, lte: toDate },
      }),
      include: { subject: { select: { name: true, code: true } } },
    });

    const bySubject: Record<string, { name: string; total: number; present: number }> = {};
    for (const r of records) {
      const key = r.subjectId;
      if (!bySubject[key]) bySubject[key] = { name: r.subject.name, total: 0, present: 0 };
      bySubject[key].total++;
      if (r.status === 'PRESENT' || r.status === 'LATE') bySubject[key].present++;
    }

    return Object.entries(bySubject).map(([subjectId, v]) => ({
      subjectId,
      subjectName: v.name,
      total: v.total,
      present: v.present,
      percentage: v.total > 0 ? Math.round((v.present / v.total) * 100) : 0,
    }));
  }

  async getDailySummary(schoolId: string, date: Date, classId: string) {
    const studentIds = (
      await this.prisma.$queryRaw<{ student_id: string }[]>`
        SELECT student_id FROM class_students
        WHERE class_id = ${classId}::uuid AND school_id = ${schoolId}::uuid
      `
    ).map((r) => r.student_id);

    return this.prisma.attendanceRecord.groupBy({
      by: ['status'],
      where: this.scopeToSchool(schoolId, {
        date,
        studentId: { in: studentIds },
      }),
      _count: { status: true },
    });
  }
}

