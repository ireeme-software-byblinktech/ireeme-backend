import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AttendanceService } from './attendance.service';
import { AttendanceRepository } from './attendance.repository';
import { AttendanceStatus } from '@prisma/client';

describe('AttendanceService', () => {
  let service: AttendanceService;
  let repo: AttendanceRepository;
  let events: EventEmitter2;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        {
          provide: AttendanceRepository,
          useValue: {
            bulkUpsert: jest.fn(),
            calculateSummary: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AttendanceService>(AttendanceService);
    repo = module.get<AttendanceRepository>(AttendanceRepository);
    events = module.get<EventEmitter2>(EventEmitter2);
  });

  it('should mark bulk attendance and handle duplicate dates via repo upsert', async () => {
    const schoolId = 'school-1';
    const markedById = 'user-1';
    const dto = {
      subjectId: 'sub-1',
      date: '2025-01-01',
      records: [
        { studentId: 'student-1', status: AttendanceStatus.PRESENT },
        { studentId: 'student-2', status: AttendanceStatus.ABSENT },
      ],
    };

    await service.markBulk(schoolId, markedById, dto);

    expect(repo.bulkUpsert).toHaveBeenCalledWith(
      schoolId,
      dto.subjectId,
      expect.any(Date),
      markedById,
      dto.records,
    );
    expect(events.emit).toHaveBeenCalledWith('attendance.marked', expect.any(Object));
  });

  it('should calculate summary percentage accurately', async () => {
    const studentId = 'student-1';
    const schoolId = 'school-1';
    const mockSummary = [
      {
        subjectId: 'sub-1',
        subjectName: 'Math',
        total: 10,
        present: 8,
        percentage: 80,
      },
    ];

    jest.spyOn(repo, 'calculateSummary').mockResolvedValue(mockSummary);

    const result = await service.calculateSummary(studentId, schoolId, '2025-01-01', '2025-01-31');

    expect(result).toEqual(mockSummary);
    expect(result[0].percentage).toBe(80);
  });
});
