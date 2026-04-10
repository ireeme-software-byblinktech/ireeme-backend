import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GradeSubmissionDto {
  @ApiProperty({
    description: 'Score achieved',
    example: 85,
  })
  @IsNumber()
  @Min(0)
  score: number;

  @ApiProperty({
    description: 'Maximum possible score',
    example: 100,
  })
  @IsNumber()
  @Min(0)
  maxScore: number;

  @ApiProperty({
    description: 'Feedback from teacher',
    example: 'Good work, but needs improvement on question 3',
    required: false,
  })
  @IsOptional()
  @IsString()
  feedback?: string;

  @ApiProperty({
    description: 'Academic term ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  termId: string;
}

export class CreateGradeDto extends GradeSubmissionDto {
  @ApiProperty({
    description: 'Submission ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  submissionId: string;
}

export class AppealDto {
  @ApiProperty({
    description: 'Reason for appeal',
    example: 'I believe question 5 was graded incorrectly',
  })
  @IsString()
  reason: string;
}

export class ResolveAppealDto {
  @ApiProperty({
    description: 'Appeal resolution status',
    enum: ['APPROVED', 'REJECTED'],
    example: 'APPROVED',
  })
  @IsString()
  status: 'APPROVED' | 'REJECTED';

  @ApiProperty({
    description: 'Reason for resolution',
    example: 'After review, the grade has been adjusted',
  })
  @IsString()
  reason: string;
}
