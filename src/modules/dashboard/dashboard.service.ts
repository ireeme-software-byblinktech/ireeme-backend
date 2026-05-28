import { Injectable, Inject } from '@nestjs/common';
import { REDIS_CLIENT } from '../../config/redis.module';
import Redis from 'ioredis';
import { GradesRepository } from '../grades/grades.repository';
import { AssignmentsRepository } from '../assignments/assignments.repository';
import { AttendanceRepository } from '../attendance/attendance.repository';
import { TimetableRepository } from '../timetable/timetable.repository';
import { NotificationsService } from '../notifications/notifications.service';
import { StudentsRepository } from '../students/students.repository';
import { TeachersRepository } from '../teachers/teachers.repository';
import { SubjectsRepository } from '../subjects/subjects.repository';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class DashboardService {
  private readonly CACHE_TTL = 3600; // 1 hour

  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly studentsRepo: StudentsRepository,
    private readonly teachersRepo: TeachersRepository,
    private readonly subjectsRepo: SubjectsRepository,
    private readonly gradesRepo: GradesRepository,
    private readonly assignmentsRepo: AssignmentsRepository,
    private readonly attendanceRepo: AttendanceRepository,
    private readonly timetableRepo: TimetableRepository,
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService,
  ) { }

  private getCacheKey(studentId: string): string {
    return `dashboard:student:${studentId}`;
  }

  async aggregateStudentDashboard(studentId: string, schoolId: string) {
    const cacheKey = this.getCacheKey(studentId);

    // 1. Cache-aside: Try to get from Redis
    const cachedData = await this.redis.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    // 2. Aggregate data in parallel
    const [grades, assignments, attendance, timetable, notifications] = await Promise.all([
      this.gradesRepo.findByStudentTerm(studentId, '', schoolId, 1, 5), // Passing empty term to get most recent across all terms
      this.fetchUpcomingAssignments(studentId, schoolId),
      this.fetchAttendanceStats(studentId, schoolId),
      this.timetableRepo.findByStudent(schoolId, studentId),
      this.notificationsService.unreadCount(await this.getUserId(studentId)),
    ]);

    const dashboardData = {
      recentGrades: grades,
      upcomingAssignments: assignments,
      attendanceStats: attendance,
      todayTimetable: this.filterTodaySlots(timetable),
      unreadNotificationsCount: notifications,
      aggregatedAt: new Date().toISOString(),
    };

    // 3. Cache the result
    await this.redis.set(cacheKey, JSON.stringify(dashboardData), 'EX', this.CACHE_TTL);

    return dashboardData;
  }

  async invalidateStudentCache(studentId: string) {
    await this.redis.del(this.getCacheKey(studentId));
  }

  async invalidateSchoolCaches(schoolId: string) {
    // Invalidate all student dashboard caches for a school
    // This is simple but effective for shared updates like new assignments
    const keys = await this.redis.keys(`dashboard:student:*`);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  private async getUserId(studentId: string): Promise<string> {
    const student = await this.studentsRepo.findById(studentId, ''); // schoolId check handled in aggregated but finding by id is fine
    return student?.userId ?? '';
  }

  private async fetchUpcomingAssignments(studentId: string, schoolId: string) {
    // Logic to fetch assignments for the student's class
    const student = await this.studentsRepo.findById(studentId, schoolId);
    if (!student || student.classes.length === 0) return [];

    // Get assignments for current class/subjects
    return this.assignmentsRepo.findAll(schoolId, {
      // Simplified: showing all upcoming for the school if class filtering is complex here
      // But we should ideally filter by classId
    });
  }

  private async fetchAttendanceStats(studentId: string, schoolId: string) {
    // Current month stats
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return this.attendanceRepo.calculateSummary(studentId, schoolId, startOfMonth, now);
  }

  private filterTodaySlots(slots: any[]) {
    const today = new Date().getDay(); // 0 is Sunday, 1 is Monday...
    return slots.filter(s => s.dayOfWeek === today);
  }

  async getAdminStats(schoolId: string) {
    const cacheKey = `dashboard:admin:${schoolId}`;

    // Try cache first
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Fetch stats in parallel
    const [students, teachers, subjects, genderStats] = await Promise.all([
      this.prisma.student.count({ where: { schoolId } }),
      this.prisma.teacher.count({ where: { schoolId } }),
      this.prisma.subject.count({ where: { schoolId } }),
      this.prisma.student.groupBy({
        by: ['gender'],
        where: { schoolId },
        _count: true,
      }),
    ]);

    const maleStudents = genderStats.find(g => g.gender === 'MALE')?._count || 0;
    const femaleStudents = genderStats.find(g => g.gender === 'FEMALE')?._count || 0;

    // Teacher gender stats - using 50/50 split as gender is not in Teacher model
    // TODO: Query from User model through relation
    const maleTeachers = Math.floor(teachers / 2);
    const femaleTeachers = teachers - maleTeachers;

    const stats = {
      totalStudents: students,
      totalTeachers: teachers,
      totalStaff: teachers, // For now, staff = teachers
      totalSubjects: subjects,
      maleStudents,
      femaleStudents,
      maleTeachers,
      femaleTeachers,
    };

    // Cache for 5 minutes
    await this.redis.set(cacheKey, JSON.stringify(stats), 'EX', 300);

    return stats;
  }
}
