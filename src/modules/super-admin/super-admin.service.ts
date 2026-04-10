import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { SuperAdminRepository } from './super-admin.repository';

@Injectable()
export class SuperAdminService {
  constructor(private readonly repo: SuperAdminRepository) {}

  // ── Schools ────────────────────────────────────────────────────────────────

  listSchools(page?: number, limit?: number) {
    return this.repo.findAllSchools(page, limit);
  }

  async createSchool(data: { name: string; code: string; region?: string }) {
    const existing = await this.repo.prisma.school.findUnique({ where: { code: data.code } });
    if (existing) throw new ConflictException('School code already exists');
    return this.repo.createSchool(data);
  }

  updateSchool(id: string, data: any) {
    return this.repo.updateSchool(id, data);
  }

  // ── Admins ─────────────────────────────────────────────────────────────────

  listAdmins(page?: number, limit?: number) {
    return this.repo.findAllAdmins(page, limit);
  }

  async createAdmin(data: any) {
    const existing = await this.repo.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictException('Email already registered');
    
    const school = await this.repo.prisma.school.findUnique({ where: { id: data.schoolId } });
    if (!school) throw new NotFoundException('School not found');

    return this.repo.createSchoolAdmin(data);
  }
}
