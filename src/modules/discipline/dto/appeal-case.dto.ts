import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AppealCaseDto {
  @ApiProperty({ description: 'Reason for appealing the discipline case' })
  @IsString()
  reason: string;
}
