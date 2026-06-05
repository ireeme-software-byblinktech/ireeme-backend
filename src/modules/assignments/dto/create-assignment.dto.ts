import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AssignmentType } from '@prisma/client';
import { Type } from 'class-transformer';

export class QuestionDto {
  @ApiProperty({
    description: 'Question type',
    enum: ['MULTIPLE_CHOICE', 'OPEN_ENDED'],
    example: 'MULTIPLE_CHOICE',
  })
  @IsString()
  type: 'MULTIPLE_CHOICE' | 'OPEN_ENDED';

  @ApiProperty({
    description: 'Question text',
    example: 'What is the capital of France?',
  })
  @IsString()
  text: string;

  @ApiProperty({
    description: 'Question order in assignment',
    example: 1,
  })
  @IsNumber()
  order: number;

  @ApiProperty({
    description: 'Points for this question',
    example: 5,
  })
  @IsNumber()
  marks: number;

  @ApiProperty({
    description: 'Multiple choice options (only for MULTIPLE_CHOICE)',
    type: [String],
    example: ['Paris', 'London', 'Berlin'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  options?: string[];

  @ApiProperty({
    description: 'Correct answer (for MULTIPLE_CHOICE: index like "0", "1", etc.)',
    example: '0',
    required: false,
  })
  @IsOptional()
  @IsString()
  correctAnswer?: string;

  @ApiProperty({
    description: 'Grading rubric for open-ended questions',
    example: 'Should explain at least two factors...',
    required: false,
  })
  @IsOptional()
  @IsString()
  rubric?: string;
}

export class CreateAssignmentDto {
  @ApiProperty({
    description: 'Subject ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  subjectId: string;

  @ApiProperty({
    description: 'Class ID (UUID) - assignment will be assigned to this class',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsString()
  classId?: string; // Optional in DTO to handle existing data

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

  @ApiProperty({
    description: 'External assignment link (Google Forms, Google Docs, etc.)',
    example: 'https://forms.google.com/...',
    required: false,
  })
  @IsOptional()
  @IsString()
  externalLink?: string;

  @ApiProperty({
    description: 'Questions for the assignment',
    type: [QuestionDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  questions?: QuestionDto[];
}

