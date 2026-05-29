import {
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

export class TeacherAttendanceEntryDto {
    @ApiProperty() @IsString() teacherId: string;
    @ApiProperty({ enum: AttendanceStatus }) @IsEnum(AttendanceStatus) status: AttendanceStatus;
    @ApiProperty({ required: false }) @IsOptional() @IsString() note?: string;
    @ApiProperty({ required: false }) @IsOptional() @IsString() checkInTime?: string;
    @ApiProperty({ required: false }) @IsOptional() @IsString() checkOutTime?: string;
}

export class MarkBulkTeacherAttendanceDto {
    @ApiProperty() @IsDateString() date: string;
    @ApiProperty({ type: [TeacherAttendanceEntryDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TeacherAttendanceEntryDto)
    records: TeacherAttendanceEntryDto[];
}
