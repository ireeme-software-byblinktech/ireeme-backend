import { IsUUID, IsInt, IsString, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSlotDto {
  @ApiProperty() @IsUUID() classId: string;
  @ApiProperty() @IsUUID() subjectId: string;
  @ApiProperty() @IsUUID() teacherId: string;
  @ApiProperty({ description: '0=Mon … 6=Sun' }) @IsInt() @Min(0) @Max(6) dayOfWeek: number;
  @ApiProperty({ example: '08:00' }) @IsString() startTime: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() room?: string;
}
