import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { BaseRepository } from '../../database/base.repository';
import { PermissionStatus, Prisma } from '@prisma/client';

@Injectable()
export class PermissionsRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async create(data: {
    schoolId: string;
    studentId: string;
    reason: string;
    fromDate: Date;
    toDate: Date;
  }) {
    return this.prisma.permissionRequest.create({
      data,
      include: { student: { include: { user: true } } },
    });
  }

  async findById(id: string, schoolId: string) {
    return this.prisma.permissionRequest.findFirst({
      where: this.scopeToSchool(schoolId, { id }),
      include: { student: { include: { user: true } } },
    });
  }

  async updateStatus(id: string, status: PermissionStatus, approvedBy: string) {
    return this.prisma.permissionRequest.update({
      where: { id },
      data: { status, approvedBy },
    });
  }

  async findAll(
    schoolId: string,
    params: {
      status?: PermissionStatus;
      studentId?: string;
      page: number;
      limit: number;
    },
  ) {
    const { status, studentId, page, limit } = params;
    const where: Prisma.PermissionRequestWhereInput = this.scopeToSchool(schoolId, {
      ...(status && { status }),
      ...(studentId && { studentId }),
    });

    const [data, total] = await Promise.all([
      this.prisma.permissionRequest.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { fromDate: 'desc' },
        include: { student: { include: { user: true } } },
      }),
      this.prisma.permissionRequest.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
