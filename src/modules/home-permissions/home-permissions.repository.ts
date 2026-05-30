import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Prisma, HomePermissionStatus } from '@prisma/client';

@Injectable()
export class HomePermissionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.HomePermissionCreateInput) {
    return this.prisma.homePermission.create({
      data,
      include: {
        student: {
          include: {
            user: true,
          },
        },
        nurse: true,
      },
    });
  }

  async findAll(schoolId: string, page = 1, limit = 50, status?: HomePermissionStatus) {
    const skip = (page - 1) * limit;
    const where: Prisma.HomePermissionWhereInput = {
      schoolId,
      ...(status && { status }),
    };

    const [data, total] = await Promise.all([
      this.prisma.homePermission.findMany({
        where,
        include: {
          student: {
            include: {
              user: true,
            },
          },
          nurse: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.homePermission.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    return this.prisma.homePermission.findUnique({
      where: { id },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        nurse: true,
      },
    });
  }

  async update(id: string, data: Prisma.HomePermissionUpdateInput) {
    return this.prisma.homePermission.update({
      where: { id },
      data,
      include: {
        student: {
          include: {
            user: true,
          },
        },
        nurse: true,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.homePermission.delete({
      where: { id },
    });
  }

  async getStats(schoolId: string) {
    const [active, returned, overdue, thisWeek] = await Promise.all([
      this.prisma.homePermission.count({
        where: { schoolId, status: HomePermissionStatus.ACTIVE },
      }),
      this.prisma.homePermission.count({
        where: { schoolId, status: HomePermissionStatus.RETURNED },
      }),
      this.prisma.homePermission.count({
        where: { schoolId, status: HomePermissionStatus.OVERDUE },
      }),
      this.prisma.homePermission.count({
        where: {
          schoolId,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return { active, returned, overdue, thisWeek };
  }
}
