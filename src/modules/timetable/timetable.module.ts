import { Module } from '@nestjs/common';
import { TimetableController } from './timetable.controller';
import { TimetableService } from './timetable.service';
import { TimetableRepository } from './timetable.repository';

@Module({
  controllers: [TimetableController],
  providers: [TimetableService, TimetableRepository],
  exports: [TimetableService],
})
export class TimetableModule {}
