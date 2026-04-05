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
  @ApiProperty() @IsString() subjectId: string;
  @ApiProperty() @IsString() title: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
  @ApiProperty({ enum: AssignmentType }) @IsEnum(AssignmentType) type: AssignmentType;
  @ApiProperty() @IsNumber() maxScore: number;
  @ApiProperty({ default: 1.0 }) @IsNumber() weight: number;
  @ApiProperty() @IsDateString() dueAt: string;
  @ApiProperty({ default: false }) @IsOptional() @IsBoolean() allowLate?: boolean;
  @ApiProperty({ type: [String], required: false }) @IsOptional() @IsArray() fileUrls?: string[];
}
