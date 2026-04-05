import { Injectable } from '@nestjs/common';
import { TimetableRepository } from './timetable.repository';
import { CreateSlotDto } from './dto/create-slot.dto';

@Injectable()
export class TimetableService {
  constructor(private readonly repo: TimetableRepository) {}

  findByClass(classId: string) {
    return this.repo.findByClass(classId);
  }
  findByTeacher(teacherId: string) {
    return this.repo.findByTeacher(teacherId);
  }
  create(dto: CreateSlotDto) {
    return this.repo.create(dto);
  }
  delete(id: string) {
    return this.repo.delete(id);
  }
}
