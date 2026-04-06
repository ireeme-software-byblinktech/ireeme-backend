import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { BaseRepository } from '../../database/base.repository';

@Injectable()
export class LibraryRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  // ── Books ──────────────────────────────────────────────────────────────────

  async findAllBooks(
    schoolId: string,
    page: number,
    limit: number,
    search?: string,
    genre?: string,
  ) {
    const where = this.scopeToSchool(schoolId, {
      ...(genre && { genre }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { author: { contains: search, mode: 'insensitive' as const } },
          { isbn: { contains: search, mode: 'insensitive' as const } },
          { genre: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    });

    const [data, total] = await Promise.all([
      this.prisma.libraryBook.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { title: 'asc' },
      }),
      this.prisma.libraryBook.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  findBookById(id: string, schoolId: string) {
    return this.prisma.libraryBook.findFirst({
      where: this.scopeToSchool(schoolId, { id }),
    });
  }

  createBook(data: {
    schoolId: string;
    title: string;
    author: string;
    isbn?: string;
    genre?: string;
    totalCopies: number;
    coverUrl?: string;
  }) {
    return this.prisma.libraryBook.create({ data: { ...data, available: data.totalCopies } });
  }

  decrementAvailable(id: string) {
    return this.prisma.libraryBook.update({
      where: { id },
      data: { available: { decrement: 1 } },
    });
  }

  incrementAvailable(id: string) {
    return this.prisma.libraryBook.update({
      where: { id },
      data: { available: { increment: 1 } },
    });
  }

  // ── Borrowings ─────────────────────────────────────────────────────────────

  createBorrowing(data: { bookId: string; studentId: string; dueDate: Date }) {
    return this.prisma.borrowing.create({ data });
  }

  findActiveBorrowings(studentId: string) {
    return this.prisma.borrowing.findMany({
      where: { studentId, returnedAt: null },
      include: { book: { select: { title: true, author: true } } },
    });
  }

  findBorrowingById(id: string) {
    return this.prisma.borrowing.findUnique({ where: { id }, include: { book: true } });
  }

  returnBook(id: string) {
    return this.prisma.borrowing.update({
      where: { id },
      data: { returnedAt: new Date(), status: 'RETURNED' },
    });
  }
}
