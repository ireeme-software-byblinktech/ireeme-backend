import { IsString, IsUUID, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateHealthRecordDto {
  @ApiProperty({ description: 'Student ID' })
  @IsUUID()
  studentId: string;

  @ApiProperty({ example: '2025-01-15T09:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  visitDate?: string;

  @ApiProperty({ example: 'Malaria' })
  @IsString()
  diagnosis: string;

  @ApiProperty({ example: 'Prescribed Coartem', required: false })
  @IsOptional()
  @IsString()
  treatment?: string;
}
