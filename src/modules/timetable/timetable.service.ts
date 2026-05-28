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

  async getTodaySchedule(user: JwtPayload) {
    const schoolId = user.schoolId!;
    const today = new Date();
    // Convert to day of week (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = today.getDay();

    let slots: any[] = [];

    if (user.roles.includes(RoleType.TEACHER)) {
      const teacher = await this.teachersRepo.findByUserId(user.sub, schoolId);
      if (teacher) {
        slots = await this.repo.findByTeacher(schoolId, teacher.id);
        // Filter for today
        slots = slots.filter((s: any) => s.dayOfWeek === dayOfWeek);
      }
    } else if (user.roles.includes(RoleType.STUDENT)) {
      const student = await this.studentsRepo.findByUserId(user.sub, schoolId);
      if (student) {
        slots = await this.repo.findByStudent(schoolId, student.id);
        // Filter for today
        slots = slots.filter((s: any) => s.dayOfWeek === dayOfWeek);
      }
    }

    // Transform to match frontend expectations
    const formattedSlots = slots.map((slot: any) => ({
      id: slot.id,
      time: slot.startTime,
      subject: slot.subject?.name || 'Unknown',
      class: slot.class?.name || 'Unknown',
      room: slot.room || 'TBA',
      studentCount: 0, // Would need to query class size
      status: 'upcoming' as const,
    }));

    return { slots: formattedSlots };
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
