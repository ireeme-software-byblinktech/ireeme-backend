import { Injectable, ConflictException } from '@nestjs/common';
import { RoleType } from '@prisma/client';
import { TimetableRepository } from './timetable.repository';
import { StudentsRepository } from '../students/students.repository';
import { TeachersRepository } from '../teachers/teachers.repository';
import { CreateSlotDto } from './dto/create-slot.dto';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@Injectable()
export class TimetableService {
  constructor(
    private readonly repo: TimetableRepository,
    private readonly studentsRepo: StudentsRepository,
    private readonly teachersRepo: TeachersRepository,
  ) {}

  async findByUser(user: JwtPayload) {
    const schoolId = user.schoolId!;

    if (user.roles.includes(RoleType.TEACHER)) {
      const teacher = await this.teachersRepo.findByUserId(user.sub, schoolId);
      return teacher ? this.repo.findByTeacher(schoolId, teacher.id) : [];
    }

    if (user.roles.includes(RoleType.STUDENT)) {
      const student = await this.studentsRepo.findByUserId(user.sub, schoolId);
      return student ? this.repo.findByStudent(schoolId, student.id) : [];
    }

    return [];
  }

  findByClass(schoolId: string, classId: string) {
    return this.repo.findByClass(schoolId, classId);
  }

  findByTeacher(schoolId: string, teacherId: string) {
    return this.repo.findByTeacher(schoolId, teacherId);
  }

  findByStudent(schoolId: string, studentId: string) {
    return this.repo.findByStudent(schoolId, studentId);
  }

  async create(schoolId: string, dto: CreateSlotDto) {
    const { teacherId, room, dayOfWeek, startTime } = dto;

    // 1. Teacher Conflict
    const teacherConflict = await this.repo.exists(schoolId, {
      teacherId,
      dayOfWeek,
      startTime,
    });
    if (teacherConflict) {
      throw new ConflictException('Teacher is already booked at this time');
    }

    // 2. Room Conflict (if room is provided)
    if (room) {
      const roomConflict = await this.repo.exists(schoolId, {
        room,
        dayOfWeek,
        startTime,
      });
      if (roomConflict) {
        throw new ConflictException('Room is already occupied at this time');
      }
    }

    return this.repo.create({ schoolId, ...dto });
  }

  delete(schoolId: string, id: string) {
    return this.repo.delete(schoolId, id);
  }
}
