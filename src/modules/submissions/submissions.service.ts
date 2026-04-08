import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SubmissionsRepository } from './submissions.repository';
import { SubmitSubmissionDto } from './dto/submit-submission.dto';
import { AssignmentsRepository } from '../assignments/assignments.repository';

@Injectable()
export class SubmissionsService {
  constructor(
    private readonly repo: SubmissionsRepository,
    private readonly assignmentsRepo: AssignmentsRepository,
    private readonly events: EventEmitter2,
  ) {}

  async submit(userId: string, schoolId: string, dto: SubmitSubmissionDto) {
    // Look up student profile by userId
    const student = await this.repo.findStudentByUser(userId);
    if (!student) throw new NotFoundException('Student profile not found');

    const assignment = await this.assignmentsRepo.findById(dto.assignmentId, schoolId);
    if (!assignment) throw new NotFoundException('Assignment not found');

    const now = new Date();
    const isLate = now > assignment.dueAt;

    if (isLate && !assignment.allowLate) {
      throw new BadRequestException('Submission deadline has passed');
    }

    const submission = await this.repo.upsert({
      assignmentId: dto.assignmentId,
      studentId: student.id,
      schoolId,
      fileUrls: dto.fileUrls || [],
      content: dto.content,
      isLate,
    });

    this.events.emit('submission.created', {
      studentId: student.id,
      assignmentId: dto.assignmentId,
      submissionId: submission.id,
    });

    return submission;
  }

  findById(id: string) {
    return this.repo.findById(id);
  }
}
