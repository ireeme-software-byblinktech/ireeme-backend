import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { BaseRepository } from '../../database/base.repository';

@Injectable()
export class SubjectsRepository extends BaseRepository {
  constructor(prisma: PrismaService) { super(prisma); }

  findAll(schoolId: string, classId?: string) {
    return this.prisma.subject.findMany({
      where: this.scopeToSchool(schoolId, classId ? { classId } : {}),
      include: { teachers: { include: { teacher: { include: { user: { select: { firstName: true, lastName: true } } } } } } },
    });
  }

  findById(id: string, schoolId: string) {
    return this.prisma.subject.findFirst({ where: this.scopeToSchool(schoolId, { id }) });
  }

  create(data: { schoolId: string; name: string; code: string; classId?: string }) {
    return this.prisma.subject.create({ data });
  }

  update(id: string, data: Partial<{ name: string; code: string; classId: string }>) {
    return this.prisma.subject.update({ where: { id }, data });
  }
}
