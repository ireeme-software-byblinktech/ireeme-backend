import { Module, forwardRef } from '@nestjs/common';
import { SubmissionsController } from './submissions.controller';
import { SubmissionsService } from './submissions.service';
import { SubmissionsRepository } from './submissions.repository';
import { SubmissionListener } from './listeners/submission.listener';
import { AssignmentsModule } from '../assignments/assignments.module';

@Module({
  imports: [AssignmentsModule],
  controllers: [SubmissionsController],
  providers: [SubmissionsService, SubmissionsRepository, SubmissionListener],
  exports: [SubmissionsService],
})
export class SubmissionsModule {}
