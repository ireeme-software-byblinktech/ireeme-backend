import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { LibraryRepository } from './library.repository';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { CreateBorrowingDto } from './dto/create-borrowing.dto';
import { QueryBooksDto } from './dto/query-books.dto';

@Injectable()
export class LibraryService {
  constructor(private readonly repo: LibraryRepository) {}

  // ── Books ──────────────────────────────────────────────────────────────────

  findAllBooks(schoolId: string, query: QueryBooksDto) {
    return this.repo.findAllBooks(schoolId, query.page!, query.limit!, query.search, query.genre);
  }

  async findBookById(id: string, schoolId: string) {
    const book = await this.repo.findBookById(id, schoolId);
    if (!book) throw new NotFoundException('Book not found');
    return book;
  }

  createBook(schoolId: string, dto: CreateBookDto) {
    return this.repo.createBook({ schoolId, ...dto });
  }

  async updateBook(id: string, schoolId: string, dto: UpdateBookDto) {
    await this.findBookById(id, schoolId);
    return this.repo.updateBook(id, schoolId, dto);
  }

  async deleteBook(id: string, schoolId: string) {
    await this.findBookById(id, schoolId);
    return this.repo.deleteBook(id, schoolId);
  }

  // ── Borrowings ─────────────────────────────────────────────────────────────

  async borrowBook(schoolId: string, dto: CreateBorrowingDto) {
    // 1. Availability and Duplicate check
    const existing = await this.repo.findActiveBorrowingByStudent(schoolId, dto.studentId, dto.bookId);
    if (existing) {
      throw new ConflictException('Student already has an active borrowing for this book');
    }

    return this.repo.prisma.$transaction(async (tx) => {
      // 2. Lock and Check Availability
      const book = await tx.libraryBook.findUnique({
        where: { id: dto.bookId },
        select: { id: true, available: true, schoolId: true },
      });

      if (!book || book.schoolId !== schoolId) {
        throw new NotFoundException('Book not found');
      }

      if (book.available < 1) {
        throw new BadRequestException('No copies available for borrowing');
      }

      // 3. Create Borrowing & Decrement
      const [borrowing] = await Promise.all([
        tx.borrowing.create({
          data: {
            schoolId,
            bookId: dto.bookId,
            studentId: dto.studentId,
            dueDate: new Date(dto.dueDate),
          },
        }),
        tx.libraryBook.update({
          where: { id: dto.bookId },
          data: { available: { decrement: 1 } },
        }),
      ]);

      return borrowing;
    });
  }

  async returnBook(borrowingId: string, schoolId: string) {
    const borrowing = await this.repo.findBorrowingById(borrowingId);
    if (!borrowing || borrowing.schoolId !== schoolId) {
      throw new NotFoundException('Borrowing record not found');
    }
    if (borrowing.returnedAt) {
      throw new BadRequestException('Book already returned');
    }

    return this.repo.prisma.$transaction(async (tx) => {
      const [updated] = await Promise.all([
        tx.borrowing.update({
          where: { id: borrowingId },
          data: { returnedAt: new Date(), status: 'RETURNED' },
        }),
        tx.libraryBook.update({
          where: { id: borrowing.bookId },
          data: { available: { increment: 1 } },
        }),
      ]);

      return updated;
    });
  }

  findActiveBorrowings(studentId: string) {
    return this.repo.findActiveBorrowings(studentId);
  }
}
