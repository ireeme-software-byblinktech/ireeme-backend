import { IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSchoolDto {
  @ApiProperty({ example: 'Greenfield Academy' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'GFA001' })
  @IsString()
  code: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  region?: string;
}
