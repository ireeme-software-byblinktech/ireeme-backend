import { IsString, IsNotEmpty, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMedicationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  quantity: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  expiryDate: string;

  @ApiProperty({ required: false })
  @IsString()
  status?: string;
}
