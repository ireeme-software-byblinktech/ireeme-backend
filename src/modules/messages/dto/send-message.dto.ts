import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'The unique identifier of the conversation',
  })
  @IsUUID()
  convId: string;

  @ApiProperty({
    example: 'Hello, how are you?',
    description: 'The text content of the message',
    required: false,
  })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Optional attachments (files, audio, etc.)',
    required: false,
    isArray: true,
  })
  attachments?: any[];
}
