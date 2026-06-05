import { IsOptional, IsString, IsEnum } from 'class-validator';

export class UpdateNoteDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  grade?: string;

  @IsOptional()
  @IsString()
  chapter?: string;

  @IsOptional()
  @IsEnum(['PDF', 'VIDEO', 'IMAGE', 'PRESENTATION', 'DOCUMENT'])
  type?: 'PDF' | 'VIDEO' | 'IMAGE' | 'PRESENTATION' | 'DOCUMENT';

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()
  @IsString()
  fileSize?: string;
}
