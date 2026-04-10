import { IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QueryAssignmentDto {
  @ApiProperty({
    description: 'Page number',
    example: 1,
    required: false,
  })
  @IsOptional()
  page?: number;

  @ApiProperty({
    description: 'Items per page',
    example: 50,
    required: false,
  })
  @IsOptional()
  limit?: number;

  @ApiProperty({
    description: 'Filter by subject ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  subjectId?: string;

  @ApiProperty({
    description: 'Filter by status',
    example: 'SUBMITTED',
    required: false,
  })
  @IsOptional()
  status?: string;

  @ApiProperty({
    description: 'Filter by teacher ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  teacherId?: string;
}
