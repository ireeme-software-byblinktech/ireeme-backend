import { IsString, IsDateString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({ example: 'Family emergency' })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  reason: string;

  @ApiProperty({ example: '2024-04-10T08:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  fromDate: string;

  @ApiProperty({ example: '2024-04-12T17:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  toDate: string;
}
