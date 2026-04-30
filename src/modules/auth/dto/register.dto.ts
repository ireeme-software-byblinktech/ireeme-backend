import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Blink International School' })
  @IsString()
  @IsNotEmpty()
  institutionName: string;

  @ApiProperty({ example: 'K-12 School' })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty({ example: 'United States' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({ example: 'Jane' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'jane@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'securePassword123' })
  @IsString()
  @MinLength(8)
  password: string;
}
