import { IsString, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAppointmentDto {
  @ApiProperty({ description: 'Student ID' })
  @IsUUID()
  studentId: string;

  @ApiProperty({ description: 'Nurse user ID' })
  @IsUUID()
  nurseId: string;

  @ApiProperty({ example: '2025-01-20T10:00:00Z' })
  @IsDateString()
  scheduledAt: string;

  @ApiProperty({ example: 'Routine checkup' })
  @IsString()
  reason: string;
}
