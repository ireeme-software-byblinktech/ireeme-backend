import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { HealthRepository } from './health.repository';
import { CreateHealthRecordDto } from './dto/create-health-record.dto';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { CreateMedicalCaseDto } from './dto/create-medical-case.dto';
import { AppointmentStatus } from '@prisma/client';

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

  /**
   * Get all health records for the school
   */
  findAllRecords(schoolId: string, page?: number, limit?: number) {
    return this.repo.findAllRecords(schoolId, page, limit);
  }

  /**
   * Nurse: can view any student's records in their school.
   * Student/Parent: can only view records for the requesting student.
   */
  async findRecordsByStudent(
    studentId: string,
    schoolId: string,
    requesterId: string,
    requesterRoles: string[],
    page?: number,
    limit?: number,
  ) {
    const isNurseOrAdmin =
      requesterRoles.includes('NURSE') ||
      requesterRoles.includes('SCHOOL_ADMIN') ||
      requesterRoles.includes('PARENT');

    if (!isNurseOrAdmin && requesterId !== studentId) {
      throw new ForbiddenException('You can only view your own health records');
    }

    return this.repo.findRecordsByStudent(studentId, schoolId, page, limit);
  }

  // ── Medical cases ──────────────────────────────────────────────────────────

  createMedicalCase(schoolId: string, dto: CreateMedicalCaseDto) {
    return this.repo.createMedicalCase({ schoolId, ...dto });
  }

  async findMedicalCasesByStudent(
    studentId: string,
    schoolId: string,
    requesterId: string,
    requesterRoles: string[],
  ) {
    const isNurseOrAdmin =
      requesterRoles.includes('NURSE') ||
      requesterRoles.includes('SCHOOL_ADMIN') ||
      requesterRoles.includes('PARENT');

    if (!isNurseOrAdmin && requesterId !== studentId) {
      throw new ForbiddenException('You can only view your own medical cases');
    }

    return this.repo.findMedicalCasesByStudent(studentId, schoolId);
  }

  async findMedicalCaseById(id: string) {
    const c = await this.repo.findMedicalCaseById(id);
    if (!c) throw new NotFoundException('Medical case not found');
    return c;
  }

  async closeMedicalCase(id: string) {
    await this.findMedicalCaseById(id);
    return this.repo.updateMedicalCaseStatus(id, 'CLOSED');
  }

  // ── Appointments ───────────────────────────────────────────────────────────

  createAppointment(schoolId: string, dto: CreateAppointmentDto) {
    return this.repo.createAppointment({
      schoolId,
      studentId: dto.studentId,
      nurseId: dto.nurseId,
      scheduledAt: new Date(dto.scheduledAt),
      reason: dto.reason,
    });
  }

  async findAppointmentsByStudent(
    studentId: string,
    requesterId: string,
    requesterRoles: string[],
    page?: number,
    limit?: number,
  ) {
    const isNurseOrAdmin =
      requesterRoles.includes('NURSE') ||
      requesterRoles.includes('SCHOOL_ADMIN') ||
      requesterRoles.includes('PARENT');

    if (!isNurseOrAdmin && requesterId !== studentId) {
      throw new ForbiddenException('You can only view your own appointments');
    }

    return this.repo.findAppointmentsByStudent(studentId, page, limit);
  }

  async updateAppointmentStatus(id: string, status: AppointmentStatus) {
    const appt = await this.repo.findAppointmentById(id);
    if (!appt) throw new NotFoundException('Appointment not found');
    return this.repo.updateAppointmentStatus(id, status);
  }
}
