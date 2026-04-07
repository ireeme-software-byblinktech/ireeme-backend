import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { HealthService } from '../health.service';
import { HealthRepository } from '../health.repository';

const mockRepo = {
  createRecord: jest.fn(),
  findRecordsByStudent: jest.fn(),
  createMedicalCase: jest.fn(),
  findMedicalCasesByStudent: jest.fn(),
  findMedicalCaseById: jest.fn(),
  updateMedicalCaseStatus: jest.fn(),
  createAppointment: jest.fn(),
  findAppointmentsByStudent: jest.fn(),
  findAppointmentById: jest.fn(),
  updateAppointmentStatus: jest.fn(),
};

const NURSE_ROLES = ['NURSE'];
const STUDENT_ROLES = ['STUDENT'];
const STUDENT_ID = 'stu-1';
const REQUESTER_ID = 'stu-1'; // same as student = own records

describe('HealthService', () => {
  let service: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HealthService, { provide: HealthRepository, useValue: mockRepo }],
    }).compile();

    service = module.get<HealthService>(HealthService);
    jest.clearAllMocks();
  });

  // ── createRecord ──────────────────────────────────────────────────────────

  describe('createRecord', () => {
    it('creates a health record with visitDate defaulting to now', async () => {
      const dto = { studentId: STUDENT_ID, diagnosis: 'Malaria' };
      mockRepo.createRecord.mockResolvedValue({ id: 'rec-1', ...dto });

      const result = await service.createRecord('school-1', 'nurse-1', dto);
      expect(result.id).toBe('rec-1');
      expect(mockRepo.createRecord).toHaveBeenCalledWith(
        expect.objectContaining({ schoolId: 'school-1', nurseId: 'nurse-1', diagnosis: 'Malaria' }),
      );
    });

    it('passes visitDate when provided', async () => {
      const dto = { studentId: STUDENT_ID, diagnosis: 'Flu', visitDate: '2025-01-10T09:00:00Z' };
      mockRepo.createRecord.mockResolvedValue({ id: 'rec-2' });

      await service.createRecord('school-1', 'nurse-1', dto);
      expect(mockRepo.createRecord).toHaveBeenCalledWith(
        expect.objectContaining({ visitDate: new Date('2025-01-10T09:00:00Z') }),
      );
    });
  });

  // ── findRecordsByStudent ──────────────────────────────────────────────────

  describe('findRecordsByStudent', () => {
    it('nurse can view any student records', async () => {
      mockRepo.findRecordsByStudent.mockResolvedValue([]);
      await service.findRecordsByStudent('other-stu', 'school-1', 'nurse-user', NURSE_ROLES);
      expect(mockRepo.findRecordsByStudent).toHaveBeenCalled();
    });

    it('student can view own records', async () => {
      mockRepo.findRecordsByStudent.mockResolvedValue([]);
      await service.findRecordsByStudent(STUDENT_ID, 'school-1', REQUESTER_ID, STUDENT_ROLES);
      expect(mockRepo.findRecordsByStudent).toHaveBeenCalled();
    });

    it('student cannot view another student records', async () => {
      await expect(
        service.findRecordsByStudent('other-stu', 'school-1', REQUESTER_ID, STUDENT_ROLES),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ── createMedicalCase ─────────────────────────────────────────────────────

  describe('createMedicalCase', () => {
    it('creates a medical case scoped to school', async () => {
      const dto = { studentId: STUDENT_ID, diagnosis: 'Asthma', symptoms: 'Wheezing' };
      mockRepo.createMedicalCase.mockResolvedValue({ id: 'case-1', ...dto });

      const result = await service.createMedicalCase('school-1', dto);
      expect(result.id).toBe('case-1');
      expect(mockRepo.createMedicalCase).toHaveBeenCalledWith({ schoolId: 'school-1', ...dto });
    });
  });

  // ── closeMedicalCase ──────────────────────────────────────────────────────

  describe('closeMedicalCase', () => {
    it('updates medical case status to CLOSED', async () => {
      mockRepo.findMedicalCaseById.mockResolvedValue({ id: 'case-1', status: 'OPEN' });
      mockRepo.updateMedicalCaseStatus.mockResolvedValue({ id: 'case-1', status: 'CLOSED' });

      const result = await service.closeMedicalCase('case-1');
      expect(mockRepo.updateMedicalCaseStatus).toHaveBeenCalledWith('case-1', 'CLOSED');
      expect(result.status).toBe('CLOSED');
    });

    it('throws NotFoundException when medical case not found', async () => {
      mockRepo.findMedicalCaseById.mockResolvedValue(null);
      await expect(service.closeMedicalCase('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  // ── createAppointment ─────────────────────────────────────────────────────

  describe('createAppointment', () => {
    it('creates appointment with parsed date', async () => {
      const dto = { studentId: STUDENT_ID, nurseId: 'nurse-1', scheduledAt: '2025-02-01T10:00:00Z', reason: 'Checkup' };
      mockRepo.createAppointment.mockResolvedValue({ id: 'appt-1' });

      const result = await service.createAppointment(dto);
      expect(result.id).toBe('appt-1');
      expect(mockRepo.createAppointment).toHaveBeenCalledWith(
        expect.objectContaining({ scheduledAt: new Date('2025-02-01T10:00:00Z') }),
      );
    });
  });

  // ── findAppointmentsByStudent ─────────────────────────────────────────────

  describe('findAppointmentsByStudent', () => {
    it('nurse can view any student appointments', async () => {
      mockRepo.findAppointmentsByStudent.mockResolvedValue([]);
      await service.findAppointmentsByStudent('other-stu', 'nurse-user', NURSE_ROLES);
      expect(mockRepo.findAppointmentsByStudent).toHaveBeenCalled();
    });

    it('student cannot view another student appointments', async () => {
      await expect(
        service.findAppointmentsByStudent('other-stu', REQUESTER_ID, STUDENT_ROLES),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ── updateAppointmentStatus ───────────────────────────────────────────────

  describe('updateAppointmentStatus', () => {
    it('updates status when appointment exists', async () => {
      mockRepo.findAppointmentById.mockResolvedValue({ id: 'appt-1' });
      mockRepo.updateAppointmentStatus.mockResolvedValue({ id: 'appt-1', status: 'CONFIRMED' });

      const result = await service.updateAppointmentStatus('appt-1', 'CONFIRMED' as any);
      expect(result.status).toBe('CONFIRMED');
    });

    it('throws NotFoundException when appointment not found', async () => {
      mockRepo.findAppointmentById.mockResolvedValue(null);
      await expect(service.updateAppointmentStatus('bad-id', 'CONFIRMED' as any)).rejects.toThrow(NotFoundException);
    });
  });
});
