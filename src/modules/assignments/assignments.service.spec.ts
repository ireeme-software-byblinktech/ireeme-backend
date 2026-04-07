import { Test, TestingModule } from '@nestjs/testing';
import { AssignmentsService } from './assignments.service';
import { AssignmentsRepository } from './assignments.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AssignmentType } from '@prisma/client';

describe('AssignmentsService', () => {
  let service: AssignmentsService;
  let repo: AssignmentsRepository;
  let events: EventEmitter2;

  const mockRepo = {
    findAll: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    upsertSubmission: jest.fn(),
  };

  const mockEvents = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignmentsService,
        { provide: AssignmentsRepository, useValue: mockRepo },
        { provide: EventEmitter2, useValue: mockEvents },
      ],
    }).compile();

    service = module.get<AssignmentsService>(AssignmentsService);
    repo = module.get<AssignmentsRepository>(AssignmentsRepository);
    events = module.get<EventEmitter2>(EventEmitter2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should throw BadRequestException if dueAt is in the past', async () => {
      const pastDate = new Date(Date.now() - 10000).toISOString();
      const dto = { dueAt: pastDate, title: 'Old Task' } as any;

      await expect(service.create('school-1', 'teacher-1', dto))
        .rejects.toThrow(BadRequestException);
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

  describe('update', () => {
    it('should throw NotFoundException if assignment does not exist for the school', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(service.update('id-1', 'school-1', {}))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if updating dueAt to a past date', async () => {
      mockRepo.findById.mockResolvedValue({ id: 'id-1' });
      const pastDate = new Date(Date.now() - 10000).toISOString();
      
      await expect(service.update('id-1', 'school-1', { dueAt: pastDate }))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('submit', () => {
    const mockAssignment = {
      id: 'asm-1',
      dueAt: new Date(Date.now() + 5000), // Due in 5 seconds
      allowLate: false,
    };

    it('should throw BadRequestException if late and allowLate is false', async () => {
      const expiredAssignment = { ...mockAssignment, dueAt: new Date(Date.now() - 5000) };
      mockRepo.findById.mockResolvedValue(expiredAssignment);

      await expect(service.submit('asm-1', 'student-1', 'school-1', { fileUrls: [] }))
        .rejects.toThrow(BadRequestException);
    });

    it('should allow submission and emit event if on time', async () => {
      mockRepo.findById.mockResolvedValue(mockAssignment);
      mockRepo.upsertSubmission.mockResolvedValue({ id: 'sub-1' });

      const result = await service.submit('asm-1', 'student-1', 'school-1', { fileUrls: ['url1'] });

      expect(result.id).toBe('sub-1');
      expect(mockRepo.upsertSubmission).toHaveBeenCalledWith(
        'asm-1', 'student-1', 'school-1', ['url1'], false
      );
      expect(mockEvents.emit).toHaveBeenCalledWith('submission.created', expect.any(Object));
    });

    it('should allow late submission if allowLate is true', async () => {
      const lateButAllowed = { 
        ...mockAssignment, 
        dueAt: new Date(Date.now() - 5000), 
        allowLate: true 
      };
      mockRepo.findById.mockResolvedValue(lateButAllowed);
      mockRepo.upsertSubmission.mockResolvedValue({ id: 'sub-late' });

      await service.submit('asm-1', 'student-1', 'school-1', { fileUrls: [] });

      expect(mockRepo.upsertSubmission).toHaveBeenCalledWith(
        'asm-1', 'student-1', 'school-1', [], true // isLate = true
      );
    });
  });
});