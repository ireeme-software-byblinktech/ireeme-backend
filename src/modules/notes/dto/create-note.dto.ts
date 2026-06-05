import { IsString, IsEnum, IsOptional } from 'class-validator';

export class CreateNoteDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  subject: string;

  @IsString()
  grade: string;

  @IsString()
  chapter: string;

  @IsEnum(['PDF', 'VIDEO', 'IMAGE', 'PRESENTATION', 'DOCUMENT'])
  type: 'PDF' | 'VIDEO' | 'IMAGE' | 'PRESENTATION' | 'DOCUMENT';

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()
  @IsString()
  fileSize?: string;
}
