import { Injectable, NotFoundException } from '@nestjs/common';
import { MedicationsRepository } from './medications.repository';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';

@Injectable()
export class MedicationsService {
  constructor(private readonly repo: MedicationsRepository) {}

  create(schoolId: string, dto: CreateMedicationDto) {
    return this.repo.create({
      schoolId,
      name: dto.name,
      type: dto.type,
      quantity: dto.quantity,
      expiryDate: new Date(dto.expiryDate),
      status: dto.status || 'In Stock',
    });
  }

  findAll(schoolId: string, page?: number, limit?: number) {
    return this.repo.findAll(schoolId, page, limit);
  }

  async findById(id: string) {
    const medication = await this.repo.findById(id);
    if (!medication) {
      throw new NotFoundException('Medication not found');
    }
    return medication;
  }

  async update(id: string, dto: UpdateMedicationDto) {
    await this.findById(id);
    const updateData: any = {};
    if (dto.name) updateData.name = dto.name;
    if (dto.type) updateData.type = dto.type;
    if (dto.quantity) updateData.quantity = dto.quantity;
    if (dto.expiryDate) updateData.expiryDate = new Date(dto.expiryDate);
    if (dto.status) updateData.status = dto.status;
    
    return this.repo.update(id, updateData);
  }

  async delete(id: string) {
    await this.findById(id);
    return this.repo.delete(id);
  }
}
