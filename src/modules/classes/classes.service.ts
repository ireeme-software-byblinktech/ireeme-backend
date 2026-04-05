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
}
