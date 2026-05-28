import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AssignmentType } from '@prisma/client';

export class CreateAssignmentDto {
  @ApiProperty({
    description: 'Subject ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  subjectId: string;

  @ApiProperty({
    description: 'Assignment title',
    example: 'Chapter 5 Homework',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Assignment description',
    example: 'Complete exercises 1-10 from the textbook',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Assignment type',
    enum: AssignmentType,
    example: AssignmentType.HOMEWORK,
  })
  @IsEnum(AssignmentType)
  type: AssignmentType;

  @ApiProperty({
    description: 'Maximum score',
    example: 100,
  })
  @IsNumber()
  maxScore: number;

  @ApiProperty({
    description: 'Weight for grade calculation',
    example: 1.0,
    default: 1.0,
  })
  @IsNumber()
  weight: number;

  @ApiProperty({
    description: 'Due date and time (ISO datetime) - optional for drafts',
    example: '2026-04-15T23:59:59.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dueAt?: string;

  @ApiProperty({
    description: 'Allow late submissions',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  allowLate?: boolean;

  @ApiProperty({
    description: 'Attached file URLs',
    type: [String],
    example: ['https://example.com/file1.pdf'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  fileUrls?: string[];
}
