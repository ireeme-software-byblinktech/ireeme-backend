import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AttendanceRepository } from './attendance.repository';
import { MarkBulkAttendanceDto } from './dto/mark-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly repo: AttendanceRepository,
    private readonly events: EventEmitter2,
  ) { }

  async markBulk(schoolId: string, markedById: string, dto: MarkBulkAttendanceDto) {
    const date = new Date(dto.date);

    // If classId is provided, we need to get a default subject for the class
    // For now, we'll use the first subject associated with the class
    let subjectId = dto.subjectId;

    if (!subjectId && dto.classId) {
      const classSubject = await this.repo.prisma.subject.findFirst({
        where: {
          schoolId,
          classId: dto.classId,
        },
      });

      if (!classSubject) {
        throw new Error('No subject found for this class');
      }

      subjectId = classSubject.id;
    }

    if (!subjectId) {
      throw new Error('Either subjectId or classId must be provided');
    }

    const results = await this.repo.bulkUpsert(
      schoolId,
      subjectId,
      date,
      markedById,
      dto.records.map(r => ({
        studentId: r.studentId,
        status: r.status,
        note: r.note || r.remarks,
      })),
    );

    for (const record of dto.records) {
      if (record.status === 'ABSENT') {
        this.events.emit('attendance.marked', {
          studentId: record.studentId,
          schoolId,
          status: record.status,
          date: dto.date,
        });
      }
    }

    return results;
  }

  findByStudent(
    studentId: string,
    schoolId: string,
    page?: number,
    limit?: number,
    subjectId?: string,
  ) {
    return this.repo.findByStudent(studentId, schoolId, page, limit, subjectId);
  }

  calculateSummary(studentId: string, schoolId: string, fromDate: string, toDate: string) {
    return this.repo.calculateSummary(studentId, schoolId, new Date(fromDate), new Date(toDate));
  }

  getDailySummary(schoolId: string, date: string, classId?: string) {
    return this.repo.getDailySummary(schoolId, new Date(date), classId);
  }

  // Teacher Attendance Methods
  async markTeacherBulk(schoolId: string, markedById: string, dto: any) {
    const date = new Date(dto.date);

    const results = await this.repo.bulkUpsertTeacherAttendance(
      schoolId,
      date,
      markedById,
      dto.records.map((r: any) => ({
        teacherId: r.teacherId,
        status: r.status,
        note: r.note,
        checkInTime: r.checkInTime ? new Date(r.checkInTime) : undefined,
        checkOutTime: r.checkOutTime ? new Date(r.checkOutTime) : undefined,
      })),
    );

    for (const record of dto.records) {
      if (record.status === 'ABSENT') {
        this.events.emit('teacher.attendance.marked', {
          teacherId: record.teacherId,
          schoolId,
          status: record.status,
          date: dto.date,
        });
      }
    }

    return results;
  }

  getTeacherDailySummary(schoolId: string, date: string) {
    return this.repo.getTeacherDailySummary(schoolId, new Date(date));
  }
}

