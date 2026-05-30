import { IsString, IsNotEmpty, IsDateString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateHomePermissionDto {
  @ApiProperty({ description: 'Student ID' })
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({ description: 'Health issue description' })
  @IsString()
  @IsNotEmpty()
  healthIssue: string;

  @ApiProperty({ description: 'Parent or guardian name' })
  @IsString()
  @IsNotEmpty()
  parentGuardian: string;

  @ApiProperty({ description: 'Expected return date' })
  @IsDateString()
  @IsNotEmpty()
  expectedReturn: string;

  @ApiProperty({ description: 'Additional notes', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
