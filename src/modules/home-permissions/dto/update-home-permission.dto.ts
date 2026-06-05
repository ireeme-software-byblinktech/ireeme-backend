import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { HomePermissionStatus } from '@prisma/client';

export class UpdateHomePermissionDto {
  @ApiProperty({ description: 'Health issue description', required: false })
  @IsString()
  @IsOptional()
  healthIssue?: string;

  @ApiProperty({ description: 'Parent or guardian name', required: false })
  @IsString()
  @IsOptional()
  parentGuardian?: string;

  @ApiProperty({ description: 'Expected return date', required: false })
  @IsDateString()
  @IsOptional()
  expectedReturn?: string;

  @ApiProperty({ description: 'Actual return date', required: false })
  @IsDateString()
  @IsOptional()
  actualReturn?: string;

  @ApiProperty({ enum: HomePermissionStatus, required: false })
  @IsEnum(HomePermissionStatus)
  @IsOptional()
  status?: HomePermissionStatus;

  @ApiProperty({ description: 'Additional notes', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
