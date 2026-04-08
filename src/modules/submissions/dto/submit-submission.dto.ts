import { IsArray, IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitSubmissionDto {
  @ApiProperty()
  @IsUUID()
  assignmentId: string;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fileUrls?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  content?: string;
}
