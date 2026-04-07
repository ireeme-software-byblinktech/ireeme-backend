import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { BaseRepository } from '../../database/base.repository';
import { AppointmentStatus } from '@prisma/client';

@Injectable()
export class HealthRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  // ── Health records ─────────────────────────────────────────────────────────

  createRecord(data: {
    schoolId: string;
    studentId: string;
    nurseId: string;
    visitDate?: Date;
    diagnosis: string;
    treatment?: string;
  }) {
    return this.prisma.healthRecord.create({
      data: { ...data, visitDate: data.visitDate ?? new Date() },
    });
  }

  findRecordsByStudent(studentId: string, schoolId: string, page = 1, limit = 25) {
    return this.prisma.healthRecord.findMany({
      where: this.scopeToSchool(schoolId, { studentId }),
      orderBy: { visitDate: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { nurse: { select: { firstName: true, lastName: true } } },
    });
  }

  // ── Medical cases ──────────────────────────────────────────────────────────

  createMedicalCase(data: {
    schoolId: string;
    studentId: string;
    diagnosis: string;
    symptoms: string;
  }) {
    return this.prisma.medicalCase.create({ data });
  }

  findMedicalCasesByStudent(studentId: string, schoolId: string) {
    return this.prisma.medicalCase.findMany({
      where: this.scopeToSchool(schoolId, { studentId }),
      orderBy: { openedAt: 'desc' },
    });
  }

  findMedicalCaseById(id: string) {
    return this.prisma.medicalCase.findUnique({ where: { id } });
  }

  updateMedicalCaseStatus(id: string, status: any) {
    return this.prisma.medicalCase.update({ where: { id }, data: { status } });
  }

  // ── Appointments ───────────────────────────────────────────────────────────

  createAppointment(data: {
    schoolId: string;
    studentId: string;
    nurseId: string;
    scheduledAt: Date;
    reason: string;
  }) {
    return this.prisma.appointment.create({ data });
  }

  findAppointmentsByStudent(studentId: string, page = 1, limit = 25) {
    return this.prisma.appointment.findMany({
      where: { studentId },
      orderBy: { scheduledAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { nurse: { select: { firstName: true, lastName: true } } },
    });
  }

  updateAppointmentStatus(id: string, status: AppointmentStatus) {
    return this.prisma.appointment.update({ where: { id }, data: { status } });
  }
}
