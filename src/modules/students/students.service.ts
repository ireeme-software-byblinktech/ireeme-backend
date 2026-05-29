import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { StudentsRepository } from './students.repository';
import { UsersService } from '../users/users.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { QueryStudentDto } from './dto/query-student.dto';
import { CacheService } from '../../common/services/cache.service';
import { RoleType } from '@prisma/client';

@Injectable()
export class StudentsService {
  private readonly DASHBOARD_TTL = 300; // 5 min
  private readonly STUDENT_TTL = 600; // 10 min

  constructor(
    private readonly studentsRepo: StudentsRepository,
    private readonly usersService: UsersService,
    private readonly cacheService: CacheService,
  ) { }

  findAll(schoolId: string, query: QueryStudentDto) {
    return this.studentsRepo.findAll(schoolId, query);
  }

  async findById(id: string, schoolId: string) {
    const cacheKey = `school:${schoolId}:student:${id}`;

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const student = await this.studentsRepo.findById(id, schoolId);
        if (!student) throw new NotFoundException('Student not found');
        return student;
      },
      { ttl: this.STUDENT_TTL },
    );
  }

  async findByUserId(userId: string, schoolId: string) {
    const cacheKey = `school:${schoolId}:student:user:${userId}`;

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const student = await this.studentsRepo.findByUserId(userId, schoolId);
        if (!student) throw new NotFoundException('Student not found');
        return student;
      },
      { ttl: this.STUDENT_TTL },
    );
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
      const student = await this.studentsRepo.create({
        userId: user.id,
        schoolId,
        studentNumber: dto.studentNumber,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        gender: dto.gender,
      });

      // Invalidate list cache
      await this.cacheService.delPattern(`school:${schoolId}:student:list*`);

      return student;
    } catch (err: any) {
      if (err?.code === 'P2002') {
        throw new ConflictException('Student number already exists in this school');
      }
      throw err;
    }
  }

  async update(id: string, schoolId: string, dto: UpdateStudentDto) {
    const existingStudent = await this.studentsRepo.findById(id, schoolId);
    if (!existingStudent) throw new NotFoundException('Student not found');

    // Update user fields if provided
    if (dto.firstName || dto.lastName) {
      await this.usersService.update(existingStudent.userId, {
        ...(dto.firstName && { firstName: dto.firstName }),
        ...(dto.lastName && { lastName: dto.lastName }),
      });
    }

    // Update student fields
    const student = await this.studentsRepo.update(id, schoolId, {
      ...(dto.studentNumber && { studentNumber: dto.studentNumber }),
      ...(dto.dateOfBirth && { dateOfBirth: new Date(dto.dateOfBirth) }),
      ...(dto.gender && { gender: dto.gender }),
    });

    // Invalidate caches
    await Promise.all([
      this.cacheService.del(`school:${schoolId}:student:${id}`),
      this.cacheService.del(`dashboard:${schoolId}:${id}`),
      this.cacheService.delPattern(`school:${schoolId}:student:list*`),
    ]);

    return this.studentsRepo.findById(id, schoolId);
  }

  async deactivate(id: string, schoolId: string) {
    const student = await this.studentsRepo.update(id, schoolId, { isActive: false });

    // Invalidate caches
    await Promise.all([
      this.cacheService.del(`school:${schoolId}:student:${id}`),
      this.cacheService.del(`dashboard:${schoolId}:${id}`),
      this.cacheService.delPattern(`school:${schoolId}:student:list*`),
    ]);

    return student;
  }

  async getDashboard(studentId: string, schoolId: string) {
    const cacheKey = `dashboard:${schoolId}:${studentId}`;

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        await this.findById(studentId, schoolId); // 404 guard
        return this.studentsRepo.getDashboardData(studentId, schoolId);
      },
      { ttl: this.DASHBOARD_TTL },
    );
  }

  async invalidateDashboard(studentId: string, schoolId: string) {
    await this.cacheService.del(`dashboard:${schoolId}:${studentId}`);
  }

  private generateTempPassword(): string {
    return (
      Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-4).toUpperCase()
    );
  }
}
