import { IsString, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOffenseTypeDto {
  @ApiProperty({ example: 'Fighting' })
  @IsString()
  name: string;

  @ApiProperty({ example: 10, description: 'Points deducted per offense' })
  @IsInt()
  @Min(0)
  pointDeduction: number;
}
