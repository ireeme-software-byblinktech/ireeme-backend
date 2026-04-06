import { Injectable, NotFoundException } from '@nestjs/common';
import { AcademicTermsRepository } from './academic-terms.repository';
import { CreateTermDto } from './dto/create-term.dto';

@Injectable()
export class AcademicTermsService {
  constructor(private readonly repo: AcademicTermsRepository) {}

  findAll(schoolId: string) {
    return this.repo.findAll(schoolId);
  }
  findActive(schoolId: string) {
    return this.repo.findActive(schoolId);
  }

  async findById(id: string, schoolId: string) {
    const t = await this.repo.findById(id, schoolId);
    if (!t) throw new NotFoundException('Term not found');
    return t;
  }

  async create(schoolId: string, dto: CreateTermDto) {
    if (dto.isActive) await this.repo.deactivateAll(schoolId);
    return this.repo.create({
      schoolId,
      ...dto,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
    });
  }

  async update(id: string, schoolId: string, dto: Partial<CreateTermDto>) {
    await this.findById(id, schoolId);
    if (dto.isActive) await this.repo.deactivateAll(schoolId);
    return this.repo.update(id, {
      ...(dto.name && { name: dto.name }),
      ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      ...(dto.startDate && { startDate: new Date(dto.startDate) }),
      ...(dto.endDate && { endDate: new Date(dto.endDate) }),
    });
  }
}
