import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AttendanceRepository } from './attendance.repository';
import { MarkBulkAttendanceDto } from './dto/mark-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly repo: AttendanceRepository,
    private readonly events: EventEmitter2,
  ) {}

  async markBulk(schoolId: string, markedById: string, dto: MarkBulkAttendanceDto) {
    const date = new Date(dto.date);
    const results = await this.repo.bulkUpsert(
      schoolId,
      dto.subjectId,
      date,
      markedById,
      dto.records,
    );

    // Fire events for absent students → notification side effect
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

  getSummary(studentId: string, schoolId: string, fromDate: string, toDate: string) {
    return this.repo.getSummary(studentId, schoolId, new Date(fromDate), new Date(toDate));
  }

  getDailySummary(schoolId: string, date: string, classId: string) {
    return this.repo.getDailySummary(schoolId, new Date(date), classId);
  }
}
