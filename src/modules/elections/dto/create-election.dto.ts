import { IsString, IsDateString, IsArray, ValidateNested, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class PositionDto {
  @ApiProperty({ example: 'President' })
  @IsString()
  name: string;

  @ApiProperty({ example: 1, required: false })
  @IsInt()
  @Min(1)
  minVotes?: number;

  @ApiProperty({ example: 1, required: false })
  @IsInt()
  @Min(1)
  maxVotes?: number;
}

export class CreateElectionDto {
  @ApiProperty({ example: 'Student Council 2025' })
  @IsString()
  title: string;

  @ApiProperty({ example: '2025-05-01T08:00:00Z' })
  @IsDateString()
  startAt: string;

  @ApiProperty({ example: '2025-05-01T17:00:00Z' })
  @IsDateString()
  endAt: string;

  @ApiProperty({ type: [PositionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PositionDto)
  positions: PositionDto[];
}
