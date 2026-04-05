import { Injectable, NotFoundException } from '@nestjs/common';
import { HealthRepository } from './health.repository';
import { CreateHealthRecordDto } from './dto/create-health-record.dto';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { CreateMedicalCaseDto } from './dto/create-medical-case.dto';

@Injectable()
export class HealthService {
  constructor(private readonly repo: HealthRepository) {}

  // ── Health records ─────────────────────────────────────────────────────────

  createRecord(schoolId: string, nurseId: string, dto: CreateHealthRecordDto) {
    return this.repo.createRecord({
      schoolId,
      nurseId,
      studentId: dto.studentId,
      diagnosis: dto.diagnosis,
      treatment: dto.treatment,
      visitDate: dto.visitDate ? new Date(dto.visitDate) : undefined,
    });
  }

  findRecordsByStudent(studentId: string, schoolId: string, page?: number, limit?: number) {
    return this.repo.findRecordsByStudent(studentId, schoolId, page, limit);
  }

  // ── Medical cases ──────────────────────────────────────────────────────────

  createMedicalCase(schoolId: string, dto: CreateMedicalCaseDto) {
    return this.repo.createMedicalCase({ schoolId, ...dto });
  }

  findMedicalCasesByStudent(studentId: string, schoolId: string) {
    return this.repo.findMedicalCasesByStudent(studentId, schoolId);
  }

  closeMedicalCase(id: string) {
    return this.repo.updateMedicalCaseStatus(id, 'CLOSED');
  }

  // ── Appointments ───────────────────────────────────────────────────────────

  createAppointment(dto: CreateAppointmentDto) {
    return this.repo.createAppointment({
      studentId: dto.studentId,
      nurseId: dto.nurseId,
      scheduledAt: new Date(dto.scheduledAt),
      reason: dto.reason,
    });
  }

  findAppointmentsByStudent(studentId: string, page?: number, limit?: number) {
    return this.repo.findAppointmentsByStudent(studentId, page, limit);
  }

  updateAppointmentStatus(id: string, status: any) {
    return this.repo.updateAppointmentStatus(id, status);
  }
}
