import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CastVoteDto {
  @ApiProperty()
  @IsUUID()
  positionId: string;

  @ApiProperty()
  @IsUUID()
  candidateId: string;
}
