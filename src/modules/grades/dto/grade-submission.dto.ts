import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GradeSubmissionDto {
  @ApiProperty() @IsNumber() @Min(0) score: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() feedback?: string;
  @ApiProperty() @IsUUID() termId: string;
}

export class AppealDto {
  @ApiProperty() @IsString() reason: string;
}

export class ResolveAppealDto {
  @ApiProperty({ enum: ['APPROVED', 'REJECTED'] }) @IsString() status: 'APPROVED' | 'REJECTED';
  @ApiProperty() @IsString() reason: string;
}
