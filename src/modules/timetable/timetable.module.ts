import { Module } from '@nestjs/common';
import { TimetableController } from './timetable.controller';
import { TimetableService } from './timetable.service';
import { TimetableRepository } from './timetable.repository';
import { StudentsRepository } from '../students/students.repository';
import { TeachersRepository } from '../teachers/teachers.repository';

@Module({
  controllers: [TimetableController],
  providers: [TimetableService, TimetableRepository, StudentsRepository, TeachersRepository],
  exports: [TimetableService],
})
export class TimetableModule {}
