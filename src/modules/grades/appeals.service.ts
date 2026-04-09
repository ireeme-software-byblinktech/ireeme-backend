import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { AppealsRepository } from './appeals.repository';
import { GradesRepository } from './grades.repository';
import { AppealStatus } from '@prisma/client';
import { ReviewAppealDto, ReviewableStatus } from './dto/review-appeal.dto';

@Injectable()
export class AppealsService {
  constructor(
    private readonly appealsRepo: AppealsRepository,
    private readonly gradesRepo: GradesRepository,
  ) { }

  async submit(studentId: string, gradeId: string, reason: string, schoolId: string) {
    // Validate the grade belongs to this student + schoolId
    const grade = await this.gradesRepo.findById(gradeId, schoolId);
    if (!grade || grade.schoolId !== schoolId || grade.studentId !== studentId) {
      throw new NotFoundException('Grade not found');
    }

    // Check no existing appeal for this gradeId
    const existingAppeal = await this.appealsRepo.findByGradeId(gradeId, schoolId);
    if (existingAppeal) {
      throw new ConflictException('An appeal already exists for this grade');
    }

    // Create appeal with status PENDING
    return this.appealsRepo.create({
      gradeId,
      studentId,
      schoolId,
      reason,
    });
  }

  async reviewAppeal(
    appealId: string,
    status: ReviewableStatus,
    _reviewerId: string,
    schoolId: string,
  ) {

    // Status must be REVIEWING, APPROVED, or REJECTED only not needed because of the ReviewableStatus type
    /*if (
      ![AppealStatus.REVIEWING, AppealStatus.APPROVED, AppealStatus.REJECTED].includes(status)
    ) {
      throw new BadRequestException('Invalid appeal status');
    }*/


    // Validate appeal exists in this school
    const appeal = await this.appealsRepo.findById(appealId, schoolId);
    if (!appeal) {
      throw new NotFoundException('Appeal not found');
    }

    // Update appeal status
    const updatedAppeal = await this.appealsRepo.updateStatus(appealId, schoolId, status);

    // If APPROVED → update Grade.appealStatus to APPROVED
    if (status === AppealStatus.APPROVED) {
      await this.gradesRepo.updateAppeal(appeal.gradeId, schoolId, AppealStatus.APPROVED);
    }

    return updatedAppeal;
  }





  async findAll(schoolId: string, page = 1, limit = 50) {
    const maxLimit = Math.min(limit, 50);
    return this.appealsRepo.findAll(schoolId, page, maxLimit);
  }
}
