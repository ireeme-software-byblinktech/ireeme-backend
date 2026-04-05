import { IsString, IsUUID, IsInt, IsOptional, IsArray, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCaseDto {
  @ApiProperty({ description: 'Student being disciplined' })
  @IsUUID()
  studentId: string;

  @ApiProperty({ description: 'Offense type ID' })
  @IsUUID()
  offenseTypeId: string;

  @ApiProperty({ description: 'Description of the incident' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Points to deduct from student score' })
  @IsInt()
  @Min(0)
  pointsDeduct: number;

  @ApiProperty({ description: 'S3 keys of evidence files', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  evidenceUrls?: string[];
}
