import { Test, TestingModule } from '@nestjs/testing';
import { AssignmentsService } from './assignments.service';
import { AssignmentsRepository } from './assignments.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AssignmentType } from '@prisma/client';
import { SubmissionsService } from '../submissions/submissions.service';

describe('AssignmentsService', () => {
  let service: AssignmentsService;

  const mockRepo = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    upsertSubmission: jest.fn(),
    findSubmission: jest.fn(),
  };

  const mockEvents = { emit: jest.fn() };

  const mockSubmissionsService = { submit: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignmentsService,
        { provide: AssignmentsRepository, useValue: mockRepo },
        { provide: EventEmitter2, useValue: mockEvents },
        { provide: SubmissionsService, useValue: mockSubmissionsService },
      ],
    }).compile();

    service = module.get<AssignmentsService>(AssignmentsService);
    jest.clearAllMocks();
  });

  // ── create ────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should throw BadRequestException if dueAt is in the past', async () => {
      const pastDate = new Date(Date.now() - 10000).toISOString();
      const dto = { dueAt: pastDate, title: 'Old Task' } as any;

      expect(() => service.create('school-1', 'teacher-1', dto)).toThrow(BadRequestException);
    });

    it('should create assignment if dueAt is in the future', async () => {
      const futureDate = new Date(Date.now() + 100000).toISOString();
      const dto = { dueAt: futureDate, title: 'New Task', type: AssignmentType.HOMEWORK } as any;
      mockRepo.create.mockResolvedValue({ id: 'asm-1' });

      const result = await service.create('school-1', 'teacher-1', dto);
      expect(result.id).toBe('asm-1');
      expect(mockRepo.create).toHaveBeenCalled();
    });
  });

  // ── update ────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should throw NotFoundException if assignment does not exist for the school', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(service.update('id-1', 'school-1', {})).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if updating dueAt to a past date', async () => {
      mockRepo.findById.mockResolvedValue({ id: 'id-1' });
      const pastDate = new Date(Date.now() - 10000).toISOString();

      await expect(service.update('id-1', 'school-1', { dueAt: pastDate })).rejects.toThrow(BadRequestException);
    });
  });

  // ── submit ────────────────────────────────────────────────────────────────

  describe('submit', () => {
    it('should delegate to SubmissionsService.submit', async () => {
      mockSubmissionsService.submit.mockResolvedValue({ id: 'sub-1' });

      const result = await service.submit('asm-1', 'user-1', 'school-1', { fileUrls: ['url1'] });

      expect(result.id).toBe('sub-1');
      expect(mockSubmissionsService.submit).toHaveBeenCalledWith(
        'user-1',
        'school-1',
        expect.objectContaining({ assignmentId: 'asm-1', fileUrls: ['url1'] }),
      );
    });

    it('should propagate BadRequestException from SubmissionsService (late + allowLate=false)', async () => {
      mockSubmissionsService.submit.mockRejectedValue(new BadRequestException('Submission deadline has passed'));

      await expect(service.submit('asm-1', 'user-1', 'school-1', { fileUrls: [] })).rejects.toThrow(BadRequestException);
    });

    it('should propagate NotFoundException from SubmissionsService (student not found)', async () => {
      mockSubmissionsService.submit.mockRejectedValue(new NotFoundException('Student profile not found'));

      await expect(service.submit('asm-1', 'user-1', 'school-1', { fileUrls: [] })).rejects.toThrow(NotFoundException);
    });
  });
});
