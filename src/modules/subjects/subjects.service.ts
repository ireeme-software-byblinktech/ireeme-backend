import { Injectable, NotFoundException } from '@nestjs/common';
import { SubjectsRepository } from './subjects.repository';
import { CreateSubjectDto } from './dto/create-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(private readonly repo: SubjectsRepository) {}

  findAll(schoolId: string, classId?: string) {
    return this.repo.findAll(schoolId, classId);
  }

  async findById(id: string, schoolId: string) {
    const s = await this.repo.findById(id, schoolId);
    if (!s) throw new NotFoundException('Subject not found');
    return s;
  }

  create(schoolId: string, dto: CreateSubjectDto) {
    return this.repo.create({ schoolId, ...dto });
  }

  async update(id: string, schoolId: string, dto: Partial<CreateSubjectDto>) {
    await this.findById(id, schoolId);
    return this.repo.update(id, dto);
  }

  async remove(id: string, schoolId: string) {
    await this.findById(id, schoolId);
    return this.repo.remove(id);
  }

  async assignTeacher(subjectId: string, schoolId: string, teacherId: string) {
    await this.findById(subjectId, schoolId);
    // Teacher validation could be added here if needed
    return this.repo.assignTeacher(subjectId, teacherId, schoolId);
  }

  async removeTeacher(subjectId: string, schoolId: string, teacherId: string) {
    await this.findById(subjectId, schoolId);
    return this.repo.removeTeacher(subjectId, teacherId);
  }
}
