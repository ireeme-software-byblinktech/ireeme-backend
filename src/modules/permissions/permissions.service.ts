import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PermissionsRepository } from './permissions.repository';
import { SubmitPermissionDto } from './dto/submit-permission.dto';
import { QueryPermissionsDto } from './dto/query-permissions.dto';
import { PermissionStatus } from '@prisma/client';

@Injectable()
export class PermissionsService {
  constructor(private readonly repo: PermissionsRepository) {}

  async submit(schoolId: string, studentId: string, dto: SubmitPermissionDto) {
    // Basic date validation
    const from = new Date(dto.fromDate);
    const to = new Date(dto.toDate);
    if (to < from) {
      throw new BadRequestException('End date cannot be before start date');
    }

    return this.repo.create({
      schoolId,
      studentId: dto.studentId, // Support parents submitting for their children
      reason: dto.reason,
      fromDate: from,
      toDate: to,
    });
  }

  async approve(schoolId: string, requestId: string, adminId: string) {
    const request = await this.repo.findById(requestId, schoolId);
    if (!request) throw new NotFoundException('Permission request not found');
    if (request.status !== PermissionStatus.PENDING) {
      throw new BadRequestException(`Request is already ${request.status.toLowerCase()}`);
    }

    return this.repo.updateStatus(requestId, PermissionStatus.APPROVED, adminId);
  }

  async reject(schoolId: string, requestId: string, adminId: string) {
    const request = await this.repo.findById(requestId, schoolId);
    if (!request) throw new NotFoundException('Permission request not found');
    if (request.status !== PermissionStatus.PENDING) {
      throw new BadRequestException(`Request is already ${request.status.toLowerCase()}`);
    }

    return this.repo.updateStatus(requestId, PermissionStatus.REJECTED, adminId);
  }

  findAll(schoolId: string, query: QueryPermissionsDto) {
    return this.repo.findAll(schoolId, {
      status: query.status,
      studentId: query.studentId,
      page: query.page!,
      limit: query.limit!,
    });
  }

  async findOne(id: string, schoolId: string) {
    const request = await this.repo.findById(id, schoolId);
    if (!request) throw new NotFoundException('Permission request not found');
    return request;
  }
}
