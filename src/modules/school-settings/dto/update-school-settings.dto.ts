import { IsArray, IsString, ArrayMinSize, IsOptional } from 'class-validator';

export class UpdateSchoolSettingsDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  timeSlots: string[];

  @IsOptional()
  @IsString()
  breakTime?: string; // Time when break occurs, e.g., "10:30"

  @IsOptional()
  @IsString()
  lunchTime?: string; // Time when lunch occurs, e.g., "12:00"

  @IsOptional()
  periodDuration?: number; // Duration of each period in minutes
}
