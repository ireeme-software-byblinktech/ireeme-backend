import { IsString, IsEmail, IsOptional, IsDateString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTeacherDto {
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() @MinLength(2) firstName: string;
  @ApiProperty() @IsString() @MinLength(2) lastName: string;
  @ApiProperty() @IsString() employeeNum: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() department?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() qualification?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsDateString() joiningDate?: string;
}
