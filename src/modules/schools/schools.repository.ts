import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { BaseRepository } from '../../database/base.repository';

@Injectable()
export class SchoolsRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findAll(page = 1, limit = 25) {
    return this.prisma.school.findMany({ skip: (page - 1) * limit, take: limit });
  }

  findById(id: string) {
    return this.prisma.school.findUnique({ where: { id } });
  }

  findByCode(code: string) {
    return this.prisma.school.findUnique({ where: { code } });
  }

  create(data: { name: string; code: string; region?: string }) {
    return this.prisma.school.create({ data });
  }

  update(id: string, data: Partial<{ name: string; region: string; logoUrl: string; isActive: boolean }>) {
    return this.prisma.school.update({ where: { id }, data });
  }
}
