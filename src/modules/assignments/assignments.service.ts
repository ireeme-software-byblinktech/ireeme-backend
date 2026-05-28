import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AssignmentsRepository } from './assignments.repository';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
import { TeachersRepository } from '../teachers/teachers.repository';
import { SubmissionsService } from '../submissions/submissions.service';

@Injectable()
export class AssignmentsService {
  constructor(
    private readonly repo: AssignmentsRepository,
    private readonly events: EventEmitter2,
    private readonly teachersRepo: TeachersRepository,
    @Inject(forwardRef(() => SubmissionsService))
    private readonly submissionsService: SubmissionsService,
  ) {}

  findAll(schoolId: string, subjectId?: string, teacherUserId?: string) {
    return this.repo.findAll(schoolId, { subjectId, teacherUserId });
  }

  async findById(id: string, schoolId: string) {
    const a = await this.repo.findById(id, schoolId);
    if (!a) throw new NotFoundException('Assignment not found');
    return a;
  }

  async create(schoolId: string, teacherId: string, dto: CreateAssignmentDto) {
    // Validate dueAt if provided
    if (dto.dueAt) {
      const dueAt = new Date(dto.dueAt);
      if (dueAt <= new Date()) throw new BadRequestException('dueAt must be in the future');
    }
    
    // Get the teacher record by user ID
    const teacher = await this.teachersRepo.findByUserId(teacherId, schoolId);
    if (!teacher) throw new NotFoundException('Teacher not found');
    
    const assignment = await this.repo.create({ 
      schoolId, 
      teacherId: teacher.id, 
      ...dto, 
      dueAt: dto.dueAt ? new Date(dto.dueAt) : new Date(),
    });

    this.events.emit('assignment.created', {
      assignmentId: assignment.id,
      schoolId,
      subjectId: dto.subjectId,
    });

    return assignment;
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

  async delete(id: string, schoolId: string) {
    await this.findById(id, schoolId);
    return this.repo.delete(id);
  }

  async submit(
    assignmentId: string,
    userId: string,
    schoolId: string,
    dto: SubmitAssignmentDto,
  ) {
    return this.submissionsService.submit(userId, schoolId, {
      assignmentId,
      ...dto,
    });
  }

  /** Exposed for GradesService — keeps layer chain clean */
  findSubmission(submissionId: string) {
    return this.repo.findSubmission(submissionId);
  }
}
