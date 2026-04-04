import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import Redis from 'ioredis';
import { StudentsRepository } from './students.repository';
import { UsersService } from '../users/users.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { QueryStudentDto } from './dto/query-student.dto';
import { REDIS_CLIENT } from '../../config/redis.module';
import { RoleType } from '@prisma/client';

@Injectable()
export class StudentsService {
  private readonly DASHBOARD_TTL = 300; // 5 min

  constructor(
    private readonly studentsRepo: StudentsRepository,
    private readonly usersService: UsersService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  findAll(schoolId: string, query: QueryStudentDto) {
    return this.studentsRepo.findAll(schoolId, query);
  }

  async findById(id: string, schoolId: string) {
    const student = await this.studentsRepo.findById(id, schoolId);
    // scopeToSchool in repo means null = not in this school → 404
    if (!student) throw new NotFoundException('Student not found');
    return student;
  }

  async create(schoolId: string, dto: CreateStudentDto) {
    // Atomic: create user + student profile in one transaction
    const user = await this.usersService.createWithRole({
      schoolId,
      email: dto.email,
      password: this.generateTempPassword(),
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: RoleType.STUDENT,
    });

    try {
      return await this.studentsRepo.create({
        userId: user.id,
        schoolId,
        studentNumber: dto.studentNumber,
        classId: dto.classId,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        gender: dto.gender,
      });
    } catch (err: any) {
      // Unique constraint on studentNumber
      if (err?.code === 'P2002') {
        throw new ConflictException('Student number already exists in this school');
      }
      throw err;
    }
  }

  async update(id: string, schoolId: string, dto: UpdateStudentDto) {
    await this.findById(id, schoolId); // ensures 404 if wrong school
    return this.studentsRepo.update(id, schoolId, {
      ...(dto.studentNumber && { studentNumber: dto.studentNumber }),
      ...(dto.classId && { classId: dto.classId }),
      ...(dto.dateOfBirth && { dateOfBirth: new Date(dto.dateOfBirth) }),
      ...(dto.gender && { gender: dto.gender }),
    });
  }

  async getDashboard(studentId: string, schoolId: string) {
    const cacheKey = `dashboard:${schoolId}:${studentId}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    await this.findById(studentId, schoolId); // 404 guard
    const data = await this.studentsRepo.getDashboardData(studentId, schoolId);

    await this.redis.setex(cacheKey, this.DASHBOARD_TTL, JSON.stringify(data));
    return data;
  }

  async invalidateDashboard(studentId: string, schoolId: string) {
    await this.redis.del(`dashboard:${schoolId}:${studentId}`);
  }

  private generateTempPassword(): string {
    return Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-4).toUpperCase();
  }
}
