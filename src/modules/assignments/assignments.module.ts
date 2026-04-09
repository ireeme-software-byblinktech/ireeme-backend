import { Module, forwardRef } from '@nestjs/common';
import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';
import { AssignmentsRepository } from './assignments.repository';
import { SubmissionsService } from '../submissions/submissions.service';
import { SubmissionsRepository } from '../submissions/submissions.repository';
import { SubmissionsModule } from '../submissions/submissions.module';

@Module({
  imports: [forwardRef(() => SubmissionsModule)],
  controllers: [AssignmentsController],
  providers: [AssignmentsService, AssignmentsRepository, SubmissionsService, SubmissionsRepository],
  exports: [AssignmentsService, AssignmentsRepository],
})
export class AssignmentsModule {}
