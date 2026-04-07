import { Injectable } from '@nestjs/common';
import { TimetableRepository } from './timetable.repository';
import { CreateSlotDto } from './dto/create-slot.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@Injectable()
export class TimetableService {
  constructor(private readonly repo: TimetableRepository) {}

  findByClass(classId: string) {
    return this.repo.findByClass(classId);
  }
  findByTeacher(teacherId: string) {
    return this.repo.findByTeacher(teacherId);
  }
  create(schoolId: string, dto: CreateSlotDto) {
    return this.repo.create({ schoolId, ...dto });
  }
  delete(id: string) {
    return this.repo.delete(id);
  }
}
