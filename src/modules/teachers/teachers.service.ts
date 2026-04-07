import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { TeachersRepository } from './teachers.repository';
import { UsersService } from '../users/users.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { RoleType } from '@prisma/client';

@Injectable()
export class TeachersService {
  constructor(
    private readonly teachersRepo: TeachersRepository,
    private readonly usersService: UsersService,
  ) {}

  findAll(schoolId: string, page?: number, limit?: number) {
    return this.teachersRepo.findAll(schoolId, page, limit);
  }

  async findById(id: string, schoolId: string) {
    const teacher = await this.teachersRepo.findById(id, schoolId);
    if (!teacher) throw new NotFoundException('Teacher not found');
    return teacher;
  }

  async create(schoolId: string, dto: CreateTeacherDto) {
    const user = await this.usersService.createWithRole({
      schoolId,
      email: dto.email,
      password: Math.random().toString(36).slice(-10),
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: RoleType.TEACHER,
    });
    try {
      return await this.teachersRepo.create({
        userId: user.id,
        schoolId,
        employeeNum: dto.employeeNum,
        department: dto.department,
        qualification: dto.qualification,
        joiningDate: dto.joiningDate ? new Date(dto.joiningDate) : undefined,
      });
    } catch (err: any) {
      if (err?.code === 'P2002') throw new ConflictException('Employee number already exists');
      throw err;
    }
  }

  async update(id: string, schoolId: string, dto: UpdateTeacherDto) {
    await this.findById(id, schoolId);
    return this.teachersRepo.update(id, dto as any);
  }

  async assignSubject(id: string, schoolId: string, subjectId: string) {
    await this.findById(id, schoolId);
    return this.teachersRepo.assignSubject(id, schoolId, subjectId);
  }

  async removeSubject(id: string, schoolId: string, subjectId: string) {
    await this.findById(id, schoolId);
    return this.teachersRepo.removeSubject(id, subjectId);
  }

  async deactivate(id: string, schoolId: string) {
    await this.findById(id, schoolId);
    return this.teachersRepo.update(id, { isActive: false });
  }
}
