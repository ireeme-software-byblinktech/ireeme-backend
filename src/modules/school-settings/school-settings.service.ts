import { Injectable } from '@nestjs/common';
import { SchoolSettingsRepository } from './school-settings.repository';
import { UpdateSchoolSettingsDto } from './dto/update-school-settings.dto';

@Injectable()
export class SchoolSettingsService {
  constructor(private readonly repo: SchoolSettingsRepository) {}

  findBySchool(schoolId: string) {
    return this.repo.findBySchool(schoolId);
  }

  update(schoolId: string, dto: UpdateSchoolSettingsDto) {
    const updateData: any = { timeSlots: dto.timeSlots };
    
    if (dto.breakTime !== undefined) {
      updateData.breakTime = dto.breakTime;
    }
    if (dto.lunchTime !== undefined) {
      updateData.lunchTime = dto.lunchTime;
    }
    if (dto.periodDuration !== undefined) {
      updateData.periodDuration = dto.periodDuration;
    }

    return this.repo.upsert(schoolId, updateData);
  }
}
