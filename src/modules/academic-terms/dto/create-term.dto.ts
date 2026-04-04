import { IsString, IsDateString, IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTermDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsDateString() startDate: string;
  @ApiProperty() @IsDateString() endDate: string;
  @ApiProperty({ required: false, default: false }) @IsOptional() @IsBoolean() isActive?: boolean;
}
