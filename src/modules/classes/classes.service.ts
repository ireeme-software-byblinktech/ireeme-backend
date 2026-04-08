import { Injectable, NotFoundException } from '@nestjs/common';
import { ClassesRepository } from './classes.repository';
import { CreateClassDto } from './dto/create-class.dto';

@Injectable()
export class ClassesService {
  constructor(private readonly classesRepo: ClassesRepository) {}

  findAll(schoolId: string) {
    return this.classesRepo.findAll(schoolId);
  }

  async findById(id: string, schoolId: string) {
    const cls = await this.classesRepo.findById(id, schoolId);
    if (!cls) throw new NotFoundException('Class not found');
    return cls;
  }

  create(schoolId: string, dto: CreateClassDto) {
    return this.classesRepo.create({ schoolId, ...dto });
  }

  async update(id: string, schoolId: string, dto: Partial<CreateClassDto>) {
    await this.findById(id, schoolId);
    return this.classesRepo.update(id, dto);
  }

  async remove(id: string, schoolId: string) {
    await this.findById(id, schoolId);
    return this.classesRepo.remove(id);
  }

  async addStudent(classId: string, schoolId: string, studentId: string) {
    await this.findById(classId, schoolId);
    // Student validation could be added here if needed
    return this.classesRepo.addStudent(classId, studentId, schoolId);
  }

  async removeStudent(classId: string, schoolId: string, studentId: string) {
    await this.findById(classId, schoolId);
    return this.classesRepo.removeStudent(classId, studentId);
  }
}
