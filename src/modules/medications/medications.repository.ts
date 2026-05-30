import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { BaseRepository } from '../../database/base.repository';

@Injectable()
export class MedicationsRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  create(data: {
    schoolId: string;
    name: string;
    type: string;
    quantity: string;
    expiryDate: Date;
    status?: string;
  }) {
    return this.prisma.medication.create({ data });
  }

  findAll(schoolId: string, page = 1, limit = 100) {
    return this.prisma.medication.findMany({
      where: { schoolId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  findById(id: string) {
    return this.prisma.medication.findUnique({ where: { id } });
  }

  update(id: string, data: Partial<{
    name: string;
    type: string;
    quantity: string;
    expiryDate: Date;
    status: string;
  }>) {
    return this.prisma.medication.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.medication.delete({ where: { id } });
  }
}
