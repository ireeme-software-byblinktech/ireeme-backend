import { IsString, IsInt, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClassDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsInt() year: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() stream?: string;
  @ApiProperty() @IsUUID() termId: string;
}
