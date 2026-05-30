import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { RoleType } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepo: UsersRepository) { }

  findById(id: string) {
    return this.usersRepo.findById(id);
  }

  findBySchool(schoolId: string, page?: number, limit?: number) {
    return this.usersRepo.findBySchool(schoolId, page, limit);
  }

  createWithRole(data: {
    schoolId: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: RoleType;
  }) {
    return this.usersRepo.createWithRole(data);
  }

  update(userId: string, data: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    avatarUrl?: string;
  }) {
    return this.usersRepo.update(userId, data);
  }
}
