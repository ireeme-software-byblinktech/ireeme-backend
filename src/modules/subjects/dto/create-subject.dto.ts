import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubjectDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() code: string;
  @ApiProperty({ required: false }) @IsOptional() @IsUUID() classId?: string;
}
