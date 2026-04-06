import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMedicalCaseDto {
  @ApiProperty()
  @IsUUID()
  studentId: string;

  @ApiProperty({ example: 'Chronic Asthma' })
  @IsString()
  diagnosis: string;

  @ApiProperty({ example: 'Shortness of breath, wheezing' })
  @IsString()
  symptoms: string;
}
