import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from '../../notifications/notifications.service';
import { SubmissionsRepository } from '../submissions.repository';
import { NotificationType } from '@prisma/client';

@Injectable()
export class SubmissionListener {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly submissionsRepo: SubmissionsRepository,
  ) {}

  @OnEvent('submission.created')
  async handleSubmissionCreated(payload: {
    studentId: string;
    assignmentId: string;
    submissionId: string;
  }) {
    const submission = await this.submissionsRepo.findById(payload.submissionId);
    if (!submission || !submission.student) return;

    await this.notificationsService.send({
      userId: submission.student.userId,
      schoolId: submission.schoolId,
      title: 'Assignment Submitted',
      body: `Your submission for "${submission.assignment.title}" has been received.`,
      type: NotificationType.ASSIGNMENT,
    });
  }
}
