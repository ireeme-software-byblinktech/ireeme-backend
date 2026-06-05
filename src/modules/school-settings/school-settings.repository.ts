import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { BaseRepository } from '../../database/base.repository';

@Injectable()
export class SchoolSettingsRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findBySchool(schoolId: string) {
    return this.prisma.schoolSettings.findUnique({
      where: { schoolId },
    });
  }

  async upsert(schoolId: string, data: any) {
    return this.prisma.schoolSettings.upsert({
      where: { schoolId },
      update: data,
      create: { schoolId, ...data },
    });
  }
}
