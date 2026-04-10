import { IsString, IsDateString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitPermissionDto {
  @ApiProperty({ example: 'Family emergency' })
  @IsString()
  reason: string;

  @ApiProperty({ example: '2025-06-01T08:00:00Z' })
  @IsDateString()
  fromDate: string;

  @ApiProperty({ example: '2025-06-02T17:00:00Z' })
  @IsDateString()
  toDate: string;

  @ApiProperty({ description: 'Student ID for whom permission is requested' })
  @IsUUID()
  studentId: string;
}
