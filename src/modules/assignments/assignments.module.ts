import { Module, forwardRef } from '@nestjs/common';
import { AssignmentsController } from './assignments.controller';
import { AssignmentsService } from './assignments.service';
import { AssignmentsRepository } from './assignments.repository';
import { SubmissionsModule } from '../submissions/submissions.module';
import { TeachersModule } from '../teachers/teachers.module';

@Module({
  imports: [forwardRef(() => SubmissionsModule), TeachersModule],
  controllers: [AssignmentsController],
  providers: [AssignmentsService, AssignmentsRepository],
  exports: [AssignmentsService, AssignmentsRepository],
})
export class AssignmentsModule { }
