import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { LibraryService } from '../library.service';
import { LibraryRepository } from '../library.repository';

const mockRepo = {
  findAllBooks: jest.fn(),
  findBookById: jest.fn(),
  createBook: jest.fn(),
  decrementAvailable: jest.fn(),
  incrementAvailable: jest.fn(),
  createBorrowing: jest.fn(),
  findActiveBorrowings: jest.fn(),
  findBorrowingById: jest.fn(),
  returnBook: jest.fn(),
};

describe('LibraryService', () => {
  let service: LibraryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LibraryService, { provide: LibraryRepository, useValue: mockRepo }],
    }).compile();

    service = module.get<LibraryService>(LibraryService);
    jest.clearAllMocks();
  });

  // ── findBookById ──────────────────────────────────────────────────────────

  describe('findBookById', () => {
    it('returns book when found', async () => {
      mockRepo.findBookById.mockResolvedValue({ id: 'book-1', title: 'Test' });
      const result = await service.findBookById('book-1', 'school-1');
      expect(result.id).toBe('book-1');
    });

    it('throws NotFoundException when book not in school', async () => {
      mockRepo.findBookById.mockResolvedValue(null);
      await expect(service.findBookById('bad-id', 'school-1')).rejects.toThrow(NotFoundException);
    });
  });

  // ── borrow ────────────────────────────────────────────────────────────────

  describe('borrow', () => {
    it('creates borrowing and decrements available count', async () => {
      mockRepo.findBookById.mockResolvedValue({ id: 'book-1', available: 3 });
      mockRepo.createBorrowing.mockResolvedValue({ id: 'borrow-1' });
      mockRepo.decrementAvailable.mockResolvedValue({ available: 2 });

      const dto = { bookId: 'book-1', studentId: 'stu-1', dueDate: '2025-03-01T00:00:00Z' };
      const result = await service.borrow('school-1', dto);

      expect(result.id).toBe('borrow-1');
      expect(mockRepo.decrementAvailable).toHaveBeenCalledWith('book-1');
    });

    it('throws BadRequestException when no copies available', async () => {
      mockRepo.findBookById.mockResolvedValue({ id: 'book-1', available: 0 });

      const dto = { bookId: 'book-1', studentId: 'stu-1', dueDate: '2025-03-01T00:00:00Z' };
      await expect(service.borrow('school-1', dto)).rejects.toThrow(BadRequestException);
      expect(mockRepo.createBorrowing).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when book does not exist', async () => {
      mockRepo.findBookById.mockResolvedValue(null);

      const dto = { bookId: 'bad-id', studentId: 'stu-1', dueDate: '2025-03-01T00:00:00Z' };
      await expect(service.borrow('school-1', dto)).rejects.toThrow(NotFoundException);
    });
  });

  // ── returnBook ────────────────────────────────────────────────────────────

  describe('returnBook', () => {
    it('marks book returned and increments available count', async () => {
      mockRepo.findBorrowingById.mockResolvedValue({
        id: 'borrow-1',
        bookId: 'book-1',
        returnedAt: null,
      });
      mockRepo.returnBook.mockResolvedValue({ id: 'borrow-1', status: 'RETURNED' });
      mockRepo.incrementAvailable.mockResolvedValue({ available: 4 });

      const result = await service.returnBook('borrow-1', 'school-1');
      expect(result.status).toBe('RETURNED');
      expect(mockRepo.incrementAvailable).toHaveBeenCalledWith('book-1');
    });

    it('throws NotFoundException when borrowing record not found', async () => {
      mockRepo.findBorrowingById.mockResolvedValue(null);
      await expect(service.returnBook('bad-id', 'school-1')).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when book already returned', async () => {
      mockRepo.findBorrowingById.mockResolvedValue({
        id: 'borrow-1',
        bookId: 'book-1',
        returnedAt: new Date(),
      });
      await expect(service.returnBook('borrow-1', 'school-1')).rejects.toThrow(BadRequestException);
      expect(mockRepo.returnBook).not.toHaveBeenCalled();
    });
  });
});
