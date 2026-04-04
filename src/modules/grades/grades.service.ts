import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { GradesRepository } from './grades.repository';
import { AssignmentsRepository } from '../assignments/assignments.repository';
import { GradeSubmissionDto, AppealDto, ResolveAppealDto } from './dto/grade-submission.dto';

@Injectable()
export class GradesService {
  constructor(
    private readonly repo: GradesRepository,
    private readonly assignmentsRepo: AssignmentsRepository,
    private readonly events: EventEmitter2,
  ) {}

  async gradeSubmission(submissionId: string, teacherId: string, schoolId: string, dto: GradeSubmissionDto) {
    const submission = await this.assignmentsRepo.findSubmission(submissionId);
    if (!submission) throw new NotFoundException('Submission not found');

    const grade = await this.repo.gradeSubmission({
      schoolId, submissionId, studentId: submission.studentId,
      subjectId: submission.assignment.subjectId, teacherId,
      termId: dto.termId, score: dto.score,
      maxScore: Number(submission.assignment.maxScore), feedback: dto.feedback,
    });

    await this.repo.updateSubmissionStatus(submissionId, 'GRADED');
    this.events.emit('grade.posted', { studentId: submission.studentId, gradeId: grade.id, score: dto.score });
    return grade;
  }

  async getStudentGrades(studentId: string, termId: string, schoolId: string) {
    const grades = await this.repo.findByStudentTerm(studentId, termId, schoolId);
    const gpa = this.calculateGpa(grades);
    return { grades, gpa };
  }

  async submitAppeal(gradeId: string, _dto: AppealDto) {
    const grade = await this.repo.findById(gradeId);
    if (!grade) throw new NotFoundException('Grade not found');
    return this.repo.updateAppeal(gradeId, 'PENDING');
  }

  async resolveAppeal(gradeId: string, dto: ResolveAppealDto) {
    const grade = await this.repo.findById(gradeId);
    if (!grade) throw new NotFoundException('Grade not found');
    return this.repo.updateAppeal(gradeId, dto.status);
  }

  private calculateGpa(grades: any[]): number {
    if (!grades.length) return 0;
    const total = grades.reduce((sum, g) => sum + (Number(g.score) / Number(g.maxScore)) * 100, 0);
    return Math.round((total / grades.length) * 100) / 100;
  }
}
