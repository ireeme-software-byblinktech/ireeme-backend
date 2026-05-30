import { Injectable, NotFoundException } from '@nestjs/common';
import { HomePermissionsRepository } from './home-permissions.repository';
import { CreateHomePermissionDto } from './dto/create-home-permission.dto';
import { UpdateHomePermissionDto } from './dto/update-home-permission.dto';
import { HomePermissionStatus } from '@prisma/client';

@Injectable()
export class HomePermissionsService {
  constructor(
    private readonly repository: HomePermissionsRepository,
  ) {}

  async create(schoolId: string, nurseId: string, dto: CreateHomePermissionDto) {
    return this.repository.create({
      school: { connect: { id: schoolId } },
      student: { connect: { id: dto.studentId } },
      nurse: { connect: { id: nurseId } },
      healthIssue: dto.healthIssue,
      parentGuardian: dto.parentGuardian,
      expectedReturn: new Date(dto.expectedReturn),
      notes: dto.notes,
    });
  }

  async findAll(schoolId: string, page: number, limit: number, status?: HomePermissionStatus) {
    return this.repository.findAll(schoolId, page, limit, status);
  }

  async findById(id: string) {
    const permission = await this.repository.findById(id);
    if (!permission) {
      throw new NotFoundException(`Home permission with ID ${id} not found`);
    }
    return permission;
  }

  async update(id: string, dto: UpdateHomePermissionDto) {
    await this.findById(id); // Check if exists

    const updateData: any = {};
    if (dto.healthIssue) updateData.healthIssue = dto.healthIssue;
    if (dto.parentGuardian) updateData.parentGuardian = dto.parentGuardian;
    if (dto.expectedReturn) updateData.expectedReturn = new Date(dto.expectedReturn);
    if (dto.actualReturn) updateData.actualReturn = new Date(dto.actualReturn);
    if (dto.status) updateData.status = dto.status;
    if (dto.notes !== undefined) updateData.notes = dto.notes;

    return this.repository.update(id, updateData);
  }

  async delete(id: string) {
    await this.findById(id); // Check if exists
    return this.repository.delete(id);
  }

  async getStats(schoolId: string) {
    return this.repository.getStats(schoolId);
  }
}
