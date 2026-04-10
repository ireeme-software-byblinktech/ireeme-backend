import { IsUUID, IsString, IsOptional, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddCandidateDto {
  @ApiProperty()
  @IsUUID()
  positionId: string;

  @ApiProperty()
  @IsUUID()
  studentId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}
