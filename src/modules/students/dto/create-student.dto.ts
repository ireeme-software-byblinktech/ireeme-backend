import { IsString, IsEmail, IsOptional, IsDateString, IsEnum, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export class CreateStudentDto {
  @ApiProperty({
    description: 'Student email address',
    example: 'john@school.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Student first name',
    example: 'John',
  })
  @IsString()
  @MinLength(2)
  firstName: string;

  @ApiProperty({
    description: 'Student last name',
    example: 'Doe',
  })
  @IsString()
  @MinLength(2)
  lastName: string;

  @ApiProperty({
    description: 'Unique student number',
    example: 'STU-2024-001',
  })
  @IsString()
  studentNumber: string;

  @ApiProperty({
    description: 'Class ID (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsString()
  classId?: string;

  @ApiProperty({
    description: 'Date of birth (ISO date)',
    example: '2005-06-15',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiProperty({
    description: 'Student gender',
    example: 'MALE',
    enum: Gender,
    required: false,
  })
  @IsOptional()
  @IsEnum(Gender)
  gender?: string;

  @ApiProperty({
    description: 'Enrollment date (ISO date)',
    example: '2024-01-15',
  })
  @IsDateString()
  enrollmentDate: string;
}
