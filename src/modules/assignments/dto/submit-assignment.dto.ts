import { IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitAssignmentDto {
  @ApiProperty({ type: [String] }) @IsArray() @IsString({ each: true }) fileUrls: string[];
}
