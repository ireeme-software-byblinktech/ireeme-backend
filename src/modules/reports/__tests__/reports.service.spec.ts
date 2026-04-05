import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bullmq';
import { ReportsService } from '../reports.service';
import { PrismaService } from '../../../database/prisma.service';
import { QUEUE_REPORTS } from '../../../queues/queues.module';

const mockPrisma = {
  student: { findFirst: jest.fn() },
  user: { findFirst: jest.fn() },
  grade: { findMany: jest.fn() },
  attendanceRecord: { groupBy: jest.fn() },
  academicTerm: { findFirst: jest.fn() },
};

const mockQueue = { add: jest.fn() };

const mockStudent = { id: 'stu-1', schoolId: 'school-1', classId: 'class-1' };
const mockUser = { firstName: 'John', lastName: 'Doe', email: 'john@school.com', avatarUrl: null };
const mockTerm = { id: 'term-1', name: 'Term 1', startDate: new Date(), endDate: new Date() };

describe('ReportsService', () => {
  let service: ReportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: getQueueToken(QUEUE_REPORTS), useValue: mockQueue },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    jest.clearAllMocks();
  });

  // ── getReportCard ─────────────────────────────────────────────────────────

  describe('getReportCard', () => {
    it('returns report card with GPA and attendance summary', async () => {
      mockPrisma.student.findFirst.mockResolvedValue(mockStudent);
      mockPrisma.user.findFirst.mockResolvedValue(mockUser);
      mockPrisma.grade.findMany.mockResolvedValue([
        {
          subject: { name: 'Math', code: 'MTH' },
          score: 80,
          maxScore: 100,
          feedback: null,
          gradedAt: new Date(),
        },
        {
          subject: { name: 'English', code: 'ENG' },
          score: 90,
          maxScore: 100,
          feedback: null,
          gradedAt: new Date(),
        },
      ]);
      mockPrisma.attendanceRecord.groupBy.mockResolvedValue([
        { status: 'PRESENT', _count: { status: 20 } },
        { status: 'ABSENT', _count: { status: 2 } },
      ]);
      mockPrisma.academicTerm.findFirst.mockResolvedValue(mockTerm);
      mockQueue.add.mockResolvedValue({});

      const result = await service.getReportCard('stu-1', 'term-1', 'school-1');

      expect(result.gpa).toBe(85);
      expect(result.grades).toHaveLength(2);
      expect(result.attendance.attendancePercent).toBe(91);
      expect(result.student.name).toBe('John Doe');
      expect(mockQueue.add).toHaveBeenCalledWith(
        'generate-pdf',
        expect.any(Object),
        expect.any(Object),
      );
    });

    it('throws NotFoundException when student not found', async () => {
      mockPrisma.student.findFirst.mockResolvedValue(null);
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.grade.findMany.mockResolvedValue([]);
      mockPrisma.attendanceRecord.groupBy.mockResolvedValue([]);
      mockPrisma.academicTerm.findFirst.mockResolvedValue(mockTerm);

      await expect(service.getReportCard('bad-id', 'term-1', 'school-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws NotFoundException when term not found', async () => {
      mockPrisma.student.findFirst.mockResolvedValue(mockStudent);
      mockPrisma.user.findFirst.mockResolvedValue(mockUser);
      mockPrisma.grade.findMany.mockResolvedValue([]);
      mockPrisma.attendanceRecord.groupBy.mockResolvedValue([]);
      mockPrisma.academicTerm.findFirst.mockResolvedValue(null);

      await expect(service.getReportCard('stu-1', 'bad-term', 'school-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns gpa of 0 when no grades exist', async () => {
      mockPrisma.student.findFirst.mockResolvedValue(mockStudent);
      mockPrisma.user.findFirst.mockResolvedValue(mockUser);
      mockPrisma.grade.findMany.mockResolvedValue([]);
      mockPrisma.attendanceRecord.groupBy.mockResolvedValue([]);
      mockPrisma.academicTerm.findFirst.mockResolvedValue(mockTerm);
      mockQueue.add.mockResolvedValue({});

      const result = await service.getReportCard('stu-1', 'term-1', 'school-1');
      expect(result.gpa).toBe(0);
    });
  });
});
