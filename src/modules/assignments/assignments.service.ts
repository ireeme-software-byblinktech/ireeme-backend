import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AssignmentsRepository } from './assignments.repository';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';

@Injectable()
export class AssignmentsService {
  constructor(
    private readonly repo: AssignmentsRepository,
    private readonly events: EventEmitter2,
  ) {}

  findAll(schoolId: string, subjectId?: string, teacherId?: string) {
    return this.repo.findAll(schoolId, { subjectId, teacherId });
  }

  async findById(id: string, schoolId: string) {
    const a = await this.repo.findById(id, schoolId);
    if (!a) throw new NotFoundException('Assignment not found');
    return a;
  }

  create(schoolId: string, teacherId: string, dto: CreateAssignmentDto) {
    const dueAt = new Date(dto.dueAt);
    if (dueAt <= new Date()) throw new BadRequestException('dueAt must be in the future');
    return this.repo.create({ schoolId, teacherId, ...dto, dueAt });
  }

  async update(id: string, schoolId: string, dto: UpdateAssignmentDto) {
    await this.findById(id, schoolId);

    if (dto.dueAt) {
      const dueAt = new Date(dto.dueAt);
      if (dueAt <= new Date()) throw new BadRequestException('dueAt must be in the future');
    }

    return this.repo.update(id, {
      ...(dto.title && { title: dto.title }),
      ...(dto.description && { description: dto.description }),
      ...(dto.maxScore !== undefined && { maxScore: dto.maxScore }),
      ...(dto.allowLate !== undefined && { allowLate: dto.allowLate }),
      ...(dto.dueAt && { dueAt: new Date(dto.dueAt) }),
    });
  }

  async submit(
    assignmentId: string,
    studentId: string,
    schoolId: string,
    dto: SubmitAssignmentDto,
  ) {
    const assignment = await this.findById(assignmentId, schoolId);
    const now = new Date();
    if (now > assignment.dueAt && !assignment.allowLate) {
      throw new BadRequestException('Submission deadline has passed');
    }
    const submission = await this.repo.upsertSubmission(
      assignmentId,
      studentId,
      schoolId,
      dto.fileUrls,
      now > assignment.dueAt,
    );
    this.events.emit('submission.created', {
      studentId,
      assignmentId,
      submissionId: submission.id,
    });
    return submission;
  }

  /** Exposed for GradesService — keeps layer chain clean */
  findSubmission(submissionId: string) {
    return this.repo.findSubmission(submissionId);
  }
}
