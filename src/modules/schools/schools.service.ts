import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { SchoolsRepository } from './schools.repository';
import { CreateSchoolDto } from './dto/create-school.dto';

@Injectable()
export class SchoolsService {
  constructor(private readonly schoolsRepo: SchoolsRepository) {}

  findAll(page?: number, limit?: number) {
    return this.schoolsRepo.findAll(page, limit);
  }

  async findById(id: string) {
    const school = await this.schoolsRepo.findById(id);
    if (!school) throw new NotFoundException('School not found');
    return school;
  }

  async create(dto: CreateSchoolDto) {
    const existing = await this.schoolsRepo.findByCode(dto.code);
    if (existing) throw new ConflictException('School code already exists');
    return this.schoolsRepo.create(dto);
  }
}
