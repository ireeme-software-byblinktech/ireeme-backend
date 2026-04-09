import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { GradesRepository } from './grades.repository';
import { AssignmentsService } from '../assignments/assignments.service';
import { GradeSubmissionDto, AppealDto, ResolveAppealDto } from './dto/grade-submission.dto';

@Injectable()
export class GradesService {
  constructor(
    private readonly repo: GradesRepository,
    private readonly assignmentsService: AssignmentsService,
    private readonly events: EventEmitter2,
  ) {}

  async gradeSubmission(
    submissionId: string,
    teacherId: string,
    schoolId: string,
    dto: GradeSubmissionDto,
  ) {
    const submission = await this.assignmentsService.findSubmission(submissionId);
    if (!submission) throw new NotFoundException('Submission not found');

    const grade = await this.repo.gradeSubmission({
      schoolId,
      submissionId,
      studentId: submission.studentId,
      subjectId: submission.assignment.subjectId,
      teacherId,
      termId: dto.termId,
      score: dto.score,
      maxScore: Number(submission.assignment.maxScore),
      feedback: dto.feedback,
    });

    await this.repo.updateSubmissionStatus(submissionId, schoolId, 'GRADED');
    this.events.emit('grade.posted', {
      studentId: submission.studentId,
      gradeId: grade.id,
      score: dto.score,
    });
    return grade;
  }

  async findByStudentTerm(
    studentId: string,
    termId: string,
    schoolId: string,
    page = 1,
    limit = 50,
  ) {
    const grades = await this.repo.findByStudentTerm(studentId, termId, schoolId, page, limit);
    const gpa = this.calculateGPA(grades);
    return { grades, gpa, page, limit };
  }

  async submitAppeal(gradeId: string, schoolId: string, _dto: AppealDto) {
    const grade = await this.repo.findById(gradeId, schoolId);
    if (!grade) throw new NotFoundException('Grade not found');
    return this.repo.updateAppeal(gradeId, schoolId, 'PENDING');
  }

  async resolveAppeal(gradeId: string, schoolId: string, dto: ResolveAppealDto) {
    const grade = await this.repo.findById(gradeId, schoolId);
    if (!grade) throw new NotFoundException('Grade not found');
    return this.repo.updateAppeal(gradeId, schoolId, dto.status);
  }

  public calculateGPA(grades: any[]): number {
    if (!grades.length) return 0;
    const total = grades.reduce((sum, g) => sum + (Number(g.score) / Number(g.maxScore)) * 100, 0);
    return Math.round((total / grades.length) * 100) / 100;
  }
}
