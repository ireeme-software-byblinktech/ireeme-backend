import { Module } from '@nestjs/common';
import { GradesController } from './grades.controller';
import { GradesService } from './grades.service';
import { GradesRepository } from './grades.repository';
import { AssignmentsRepository } from '../assignments/assignments.repository';

@Module({
  controllers: [GradesController],
  providers: [GradesService, GradesRepository, AssignmentsRepository],
  exports: [GradesService],
})
export class GradesModule {}
