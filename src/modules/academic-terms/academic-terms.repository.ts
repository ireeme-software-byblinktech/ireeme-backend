import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { BaseRepository } from '../../database/base.repository';

@Injectable()
export class AcademicTermsRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findAll(schoolId: string) {
    return this.prisma.academicTerm.findMany({
      where: this.scopeToSchool(schoolId),
      orderBy: { startDate: 'desc' },
    });
  }

  findById(id: string, schoolId: string) {
    return this.prisma.academicTerm.findFirst({ where: this.scopeToSchool(schoolId, { id }) });
  }

  findActive(schoolId: string) {
    return this.prisma.academicTerm.findFirst({
      where: this.scopeToSchool(schoolId, { isActive: true }),
    });
  }

  create(data: {
    schoolId: string;
    name: string;
    startDate: Date;
    endDate: Date;
    isActive?: boolean;
  }) {
    return this.prisma.academicTerm.create({ data });
  }

  update(
    id: string,
    data: Partial<{ name: string; startDate: Date; endDate: Date; isActive: boolean }>,
  ) {
    return this.prisma.academicTerm.update({ where: { id }, data });
  }

  deactivateAll(schoolId: string) {
    return this.prisma.academicTerm.updateMany({
      where: this.scopeToSchool(schoolId),
      data: { isActive: false },
    });
  }

  remove(id: string) {
    return this.prisma.academicTerm.delete({ where: { id } });
  }
}
