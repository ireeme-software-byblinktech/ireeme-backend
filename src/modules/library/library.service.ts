import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { LibraryRepository } from './library.repository';
import { CreateBookDto } from './dto/create-book.dto';
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

  // ── Borrowings ─────────────────────────────────────────────────────────────

  async borrow(schoolId: string, dto: CreateBorrowingDto) {
    const book = await this.findBookById(dto.bookId, schoolId);
    if (book.available < 1) {
      throw new BadRequestException('No copies available for borrowing');
    }

    const [borrowing] = await Promise.all([
      this.repo.createBorrowing({
        schoolId,
        bookId: dto.bookId,
        studentId: dto.studentId,
        dueDate: new Date(dto.dueDate),
      }),
      this.repo.decrementAvailable(dto.bookId),
    ]);

    return borrowing;
  }

  async returnBook(borrowingId: string, _schoolId: string) {
    const borrowing = await this.repo.findBorrowingById(borrowingId);
    if (!borrowing) throw new NotFoundException('Borrowing record not found');
    if (borrowing.returnedAt) throw new BadRequestException('Book already returned');

    const [updated] = await Promise.all([
      this.repo.returnBook(borrowingId),
      this.repo.incrementAvailable(borrowing.bookId),
    ]);

    return updated;
  }

  findActiveBorrowings(studentId: string) {
    return this.repo.findActiveBorrowings(studentId);
  }
}
