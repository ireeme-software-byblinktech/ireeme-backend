import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DisciplineService } from '../discipline.service';
import { DisciplineRepository } from '../discipline.repository';

const mockRepo = {
  findAllOffenseTypes: jest.fn(),
  createOffenseType: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  updateStatus: jest.fn(),
  createAppeal: jest.fn(),
  findAppeal: jest.fn(),
  updateAppeal: jest.fn(),
};

const mockEvents = { emit: jest.fn() };

describe('DisciplineService', () => {
  let service: DisciplineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DisciplineService,
        { provide: DisciplineRepository, useValue: mockRepo },
        { provide: EventEmitter2, useValue: mockEvents },
      ],
    }).compile();

    service = module.get<DisciplineService>(DisciplineService);
    jest.clearAllMocks();
  });

  // ── findById ──────────────────────────────────────────────────────────────

  describe('findById', () => {
    it('returns case when found in school', async () => {
      const mockCase = { id: 'case-1', schoolId: 'school-1' };
      mockRepo.findById.mockResolvedValue(mockCase);

      const result = await service.findById('case-1', 'school-1');
      expect(result).toEqual(mockCase);
      expect(mockRepo.findById).toHaveBeenCalledWith('case-1', 'school-1');
    });

    it('throws NotFoundException when case not found or wrong school', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(service.findById('bad-id', 'school-1')).rejects.toThrow(NotFoundException);
    });
  });

  // ── create ────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('creates a case and emits discipline.case.opened event', async () => {
      const dto = {
        studentId: 'stu-1',
        offenseTypeId: 'off-1',
        description: 'Fighting',
        pointsDeduct: 10,
      };
      const created = { id: 'case-1', ...dto };
      mockRepo.create.mockResolvedValue(created);

      const result = await service.create('school-1', 'officer-1', dto);

      expect(result).toEqual(created);
      expect(mockEvents.emit).toHaveBeenCalledWith('discipline.case.opened', {
        studentId: 'stu-1',
        schoolId: 'school-1',
        caseId: 'case-1',
      });
    });
  });

  // ── close ─────────────────────────────────────────────────────────────────

  describe('close', () => {
    it('closes an existing case', async () => {
      mockRepo.findById.mockResolvedValue({ id: 'case-1' });
      mockRepo.updateStatus.mockResolvedValue({ id: 'case-1', status: 'CLOSED' });

      const result = await service.close('case-1', 'school-1');
      expect(result.status).toBe('CLOSED');
    });

    it('throws NotFoundException if case does not exist', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(service.close('bad-id', 'school-1')).rejects.toThrow(NotFoundException);
    });
  });

  // ── submitAppeal ──────────────────────────────────────────────────────────

  describe('submitAppeal', () => {
    it('creates appeal when none exists', async () => {
      mockRepo.findById.mockResolvedValue({ id: 'case-1' });
      mockRepo.findAppeal.mockResolvedValue(null);
      mockRepo.createAppeal.mockResolvedValue({ caseId: 'case-1', reason: 'Unfair' });

      const result = await service.submitAppeal('case-1', 'school-1', { reason: 'Unfair' });
      expect(result.reason).toBe('Unfair');
    });

    it('throws ConflictException if appeal already exists', async () => {
      mockRepo.findById.mockResolvedValue({ id: 'case-1' });
      mockRepo.findAppeal.mockResolvedValue({ caseId: 'case-1' });

      await expect(
        service.submitAppeal('case-1', 'school-1', { reason: 'Unfair' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  // ── resolveAppeal ─────────────────────────────────────────────────────────

  describe('resolveAppeal', () => {
    it('approves an existing appeal', async () => {
      mockRepo.findById.mockResolvedValue({ id: 'case-1' });
      mockRepo.findAppeal.mockResolvedValue({ caseId: 'case-1', status: 'PENDING' });
      mockRepo.updateAppeal.mockResolvedValue({ caseId: 'case-1', status: 'APPROVED' });

      const result = await service.resolveAppeal('case-1', 'school-1', 'APPROVED');
      expect(result.status).toBe('APPROVED');
    });

    it('throws NotFoundException if no appeal exists', async () => {
      mockRepo.findById.mockResolvedValue({ id: 'case-1' });
      mockRepo.findAppeal.mockResolvedValue(null);

      await expect(service.resolveAppeal('case-1', 'school-1', 'REJECTED')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
