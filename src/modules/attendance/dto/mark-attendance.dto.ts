import {
  IsUUID,
  IsDateString,
  IsArray,
  ValidateNested,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AttendanceStatus } from '@prisma/client';

export class AttendanceEntryDto {
  @ApiProperty() @IsUUID() studentId: string;
  @ApiProperty({ enum: AttendanceStatus }) @IsEnum(AttendanceStatus) status: AttendanceStatus;
  @ApiProperty({ required: false }) @IsOptional() @IsString() note?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() remarks?: string;
}

export class MarkBulkAttendanceDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() subjectId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() classId?: string;
  @ApiProperty() @IsDateString() date: string;
  @ApiProperty({ type: [AttendanceEntryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendanceEntryDto)
  records: AttendanceEntryDto[];
}
