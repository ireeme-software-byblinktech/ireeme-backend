import { Module } from '@nestjs/common';
import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';
import { AssignmentsRepository } from './assignments.repository';
import { SubmissionsService } from '../submissions/submissions.service';
import { SubmissionsRepository } from '../submissions/submissions.repository';

@Module({
  controllers: [AssignmentsController],
  providers: [AssignmentsService, AssignmentsRepository, SubmissionsService, SubmissionsRepository],
  exports: [AssignmentsService, AssignmentsRepository],
})
export class AssignmentsModule {}
