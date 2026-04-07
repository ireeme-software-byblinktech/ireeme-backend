import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from '../health.service';
import { HealthRepository } from '../health.repository';

const mockRepo = {
  createRecord: jest.fn(),
  findRecordsByStudent: jest.fn(),
  createMedicalCase: jest.fn(),
  findMedicalCasesByStudent: jest.fn(),
  updateMedicalCaseStatus: jest.fn(),
  createAppointment: jest.fn(),
  findAppointmentsByStudent: jest.fn(),
  updateAppointmentStatus: jest.fn(),
};

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
      const dto = { studentId: 'stu-1', diagnosis: 'Malaria' };
      mockRepo.createRecord.mockResolvedValue({ id: 'rec-1', ...dto });

      const result = await service.createRecord('school-1', 'nurse-1', dto);
      expect(result.id).toBe('rec-1');
      expect(mockRepo.createRecord).toHaveBeenCalledWith(
        expect.objectContaining({ schoolId: 'school-1', nurseId: 'nurse-1', diagnosis: 'Malaria' }),
      );
    });

    it('passes visitDate when provided', async () => {
      const dto = { studentId: 'stu-1', diagnosis: 'Flu', visitDate: '2025-01-10T09:00:00Z' };
      mockRepo.createRecord.mockResolvedValue({ id: 'rec-2' });

      await service.createRecord('school-1', 'nurse-1', dto);
      expect(mockRepo.createRecord).toHaveBeenCalledWith(
        expect.objectContaining({ visitDate: new Date('2025-01-10T09:00:00Z') }),
      );
    });
  });

  // ── createMedicalCase ─────────────────────────────────────────────────────

  describe('createMedicalCase', () => {
    it('creates a medical case scoped to school', async () => {
      const dto = { studentId: 'stu-1', diagnosis: 'Asthma', symptoms: 'Wheezing' };
      mockRepo.createMedicalCase.mockResolvedValue({ id: 'case-1', ...dto });

      const result = await service.createMedicalCase('school-1', dto);
      expect(result.id).toBe('case-1');
      expect(mockRepo.createMedicalCase).toHaveBeenCalledWith({ schoolId: 'school-1', ...dto });
    });
  });

  // ── createAppointment ─────────────────────────────────────────────────────

  describe('createAppointment', () => {
    it('creates appointment with parsed date', async () => {
      const dto = {
        studentId: 'stu-1',
        nurseId: 'nurse-1',
        scheduledAt: '2025-02-01T10:00:00Z',
        reason: 'Checkup',
      };
      mockRepo.createAppointment.mockResolvedValue({ id: 'appt-1' });

      const result = await service.createAppointment('school-1', dto);
      expect(result.id).toBe('appt-1');
      expect(mockRepo.createAppointment).toHaveBeenCalledWith(
        expect.objectContaining({ scheduledAt: new Date('2025-02-01T10:00:00Z') }),
      );
    });
  });

  // ── closeMedicalCase ──────────────────────────────────────────────────────

  describe('closeMedicalCase', () => {
    it('updates medical case status to CLOSED', async () => {
      mockRepo.updateMedicalCaseStatus.mockResolvedValue({ id: 'case-1', status: 'CLOSED' });

      const result = await service.closeMedicalCase('case-1');
      expect(mockRepo.updateMedicalCaseStatus).toHaveBeenCalledWith('case-1', 'CLOSED');
      expect(result.status).toBe('CLOSED');
    });
  });
});
