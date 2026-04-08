import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddStudentDto {
  @ApiProperty()
  @IsUUID()
  studentId: string;
}
