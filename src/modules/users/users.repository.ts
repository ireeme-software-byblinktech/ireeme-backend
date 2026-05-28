import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { BaseRepository } from '../../database/base.repository';
import { RoleType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersRepository extends BaseRepository {
  constructor(
    prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    super(prisma);
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id }, include: { roles: true } });
  }

  findBySchool(schoolId: string, page = 1, limit = 25) {
    const where = this.scopeToSchool(schoolId);
    return this.prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: { roles: true },
    });
  }

  async createWithRole(data: {
    schoolId: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: RoleType;
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
        roles: { create: { role: data.role } },
      },
      include: { roles: true },
    });
  }

  update(userId: string, data: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    avatarUrl?: string;
  }) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
    });
  }
}
