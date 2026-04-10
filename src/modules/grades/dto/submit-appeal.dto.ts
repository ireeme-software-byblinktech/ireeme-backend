import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitAppealDto {
  @ApiProperty({
    description: 'Reason for the grade appeal',
    example: 'I believe question 5 was graded incorrectly',
  })
  @IsString()
  @IsNotEmpty()
  reason: string;
}
