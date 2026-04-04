import { IsString, IsEmail, IsOptional, IsDateString, IsEnum, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export class CreateStudentDto {
  @ApiProperty({ example: 'john@school.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @MinLength(2)
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @MinLength(2)
  lastName: string;

  @ApiProperty({ example: 'STU-2024-001' })
  @IsString()
  studentNumber: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  classId?: string;

  @ApiProperty({ required: false, example: '2005-06-15' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiProperty({ required: false, enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: string;
}
