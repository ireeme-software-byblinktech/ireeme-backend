import { IsUUID, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBorrowingDto {
  @ApiProperty()
  @IsUUID()
  bookId: string;

  @ApiProperty()
  @IsUUID()
  studentId: string;

  @ApiProperty({ example: '2025-02-15T00:00:00Z', description: 'Due date for return' })
  @IsDateString()
  dueDate: string;
}
