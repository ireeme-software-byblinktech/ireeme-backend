import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { BaseRepository } from '../../database/base.repository';
import { RoleType } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SuperAdminRepository extends BaseRepository {
  constructor(
    prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    super(prisma);
  }

  // ── Schools ────────────────────────────────────────────────────────────────

  findAllSchools(page = 1, limit = 25) {
    return this.prisma.school.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  createSchool(data: { name: string; code: string; region?: string }) {
    return this.prisma.school.create({ data });
  }

  updateSchool(id: string, data: any) {
    return this.prisma.school.update({ where: { id }, data });
  }

  // ── Admins ─────────────────────────────────────────────────────────────────

  findAllAdmins(page = 1, limit = 25) {
    return this.prisma.user.findMany({
      where: { roles: { some: { role: RoleType.SCHOOL_ADMIN } } },
      skip: (page - 1) * limit,
      take: limit,
      include: { school: true, roles: true },
    });
  }

  async createSchoolAdmin(data: {
    schoolId: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    const rounds = this.config.get<number>('BCRYPT_ROUNDS', 12);
    const passwordHash = await bcrypt.hash(data.password, rounds);
    
    return this.prisma.user.create({
      data: {
        schoolId: data.schoolId,
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        roles: { create: { role: RoleType.SCHOOL_ADMIN } },
      },
      include: { school: true, roles: true },
    });
  }
}
