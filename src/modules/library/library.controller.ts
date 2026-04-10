import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { RoleType } from '@prisma/client';
import { LibraryService } from './library.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { CreateBorrowingDto } from './dto/create-borrowing.dto';
import { QueryBooksDto } from './dto/query-books.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@ApiTags('library')
@ApiBearerAuth()
@Controller('library')
export class LibraryController {
  constructor(private readonly service: LibraryService) {}

  @Get('books')
  @ApiOperation({ summary: 'Search book catalog (title, author, ISBN, genre)' })
  findAllBooks(@CurrentUser() user: JwtPayload, @Query() query: QueryBooksDto) {
    return this.service.findAllBooks(user.schoolId!, query);
  }

  @Get('books/:id')
  @ApiOperation({ summary: 'Get book by ID' })
  findBook(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.findBookById(id, user.schoolId!);
  }

  @Post('books')
  @Roles(RoleType.LIBRARIAN, RoleType.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a book to the catalog' })
  createBook(@CurrentUser() user: JwtPayload, @Body() dto: CreateBookDto) {
    return this.service.createBook(user.schoolId!, dto);
  }

  @Patch('books/:id')
  @Roles(RoleType.LIBRARIAN, RoleType.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Update a book in the catalog' })
  updateBook(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBookDto,
  ) {
    return this.service.updateBook(id, user.schoolId!, dto);
  }

  @Delete('books/:id')
  @Roles(RoleType.LIBRARIAN, RoleType.SCHOOL_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a book from the catalog' })
  deleteBook(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.deleteBook(id, user.schoolId!);
  }

  @Post('borrowings')
  @Roles(RoleType.LIBRARIAN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record new borrowing + decrement available count' })
  borrow(@CurrentUser() user: JwtPayload, @Body() dto: CreateBorrowingDto) {
    return this.service.borrowBook(user.schoolId!, dto);
  }

  @Patch('borrowings/:id/return')
  @Roles(RoleType.LIBRARIAN)
  @ApiOperation({ summary: 'Mark book as returned + increment available count' })
  returnBook(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.returnBook(id, user.schoolId!);
  }

  @Get('borrowings/student/:studentId')
  @Roles(RoleType.LIBRARIAN, RoleType.STUDENT, RoleType.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Get active borrowings for a student' })
  activeBorrowings(
    @CurrentUser() user: JwtPayload,
    @Param('studentId', ParseUUIDPipe) studentId: string,
  ) {
    // Security: Students can only view their own borrowings
    if (user.roles.includes(RoleType.STUDENT) && 
        !user.roles.includes(RoleType.LIBRARIAN) && 
        !user.roles.includes(RoleType.SCHOOL_ADMIN)) {
      if (user.sub !== studentId) {
        throw new ForbiddenException('You can only view your own borrowings');
      }
    }
    return this.service.findActiveBorrowings(studentId);
  }
}
