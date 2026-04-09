import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitAppealDto {
  @ApiProperty({ description: 'Reason for the grade appeal' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
