
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { BaseRepository } from '../../database/base.repository';
import { AttendanceStatus } from '@prisma/client';

@Injectable()
export class AttendanceRepository extends BaseRepository {
  constructor(public prisma: PrismaService) {
    super(prisma);
  }

  async bulkUpsert(
    schoolId: string,
    subjectId: string,
    date: Date,
    markedById: string,
    records: Array<{ studentId: string; status: AttendanceStatus; note?: string }>,
  ) {
    const ops = records.map((r) =>
      this.prisma.attendanceRecord.upsert({
        where: { studentId_subjectId_date: { studentId: r.studentId, subjectId, date } },
        create: {
          schoolId,
          studentId: r.studentId,
          subjectId,
          date,
          status: r.status,
          markedById,
          note: r.note,
        },
        update: { status: r.status, markedById, note: r.note },
      }),
    );
    return Promise.all(ops);
  }

  findByStudent(studentId: string, schoolId: string, page = 1, limit = 25, subjectId?: string) {
    const where = this.scopeToSchool(schoolId, {
      studentId,
      ...(subjectId ? { subjectId } : {}),
    });
    return this.prisma.attendanceRecord.findMany({
      where,
      orderBy: { date: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { subject: { select: { name: true, code: true } } },
    });
  }

  async calculateSummary(studentId: string, schoolId: string, fromDate: Date, toDate: Date) {
    const records = await this.prisma.attendanceRecord.findMany({
      where: this.scopeToSchool(schoolId, {
        studentId,
        date: { gte: fromDate, lte: toDate },
      }),
      include: { subject: { select: { name: true, code: true } } },
    });

    const bySubject: Record<string, { name: string; total: number; present: number }> = {};
    for (const r of records) {
      const key = r.subjectId;
      if (!bySubject[key]) bySubject[key] = { name: r.subject.name, total: 0, present: 0 };
      bySubject[key].total++;
      if (r.status === 'PRESENT' || r.status === 'LATE') bySubject[key].present++;
    }

    return Object.entries(bySubject).map(([subjectId, v]) => ({
      subjectId,
      subjectName: v.name,
      total: v.total,
      present: v.present,
      percentage: v.total > 0 ? Math.round((v.present / v.total) * 100) : 0,
    }));
  }

  async getDailySummary(schoolId: string, date: Date, classId?: string) {
    // If no classId provided, get all students across all classes
    if (!classId) {
      // Get all students in the school
      const allStudents = await this.prisma.student.findMany({
        where: {
          schoolId,
          isActive: true,
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      const studentIds = allStudents.map((s) => s.id);
      const totalStudents = studentIds.length;

      // Get attendance records for the date
      const attendanceRecords = await this.prisma.attendanceRecord.findMany({
        where: this.scopeToSchool(schoolId, {
          date,
          studentId: { in: studentIds },
        }),
        include: {
          student: {
            select: {
              id: true,
              studentNumber: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      // Create a map of studentId to attendance record
      const attendanceMap = new Map(
        attendanceRecords.map((record) => [record.studentId, record])
      );

      // Build complete records array with all students
      const records = allStudents.map((student) => {
        const existingRecord = attendanceMap.get(student.id);
        return {
          id: existingRecord?.id || `temp-${student.id}`,
          studentId: student.id,
          date: date.toISOString(),
          status: existingRecord?.status || 'ABSENT',
          remarks: existingRecord?.note || null,
          student: {
            studentNumber: student.studentNumber,
            user: {
              firstName: student.user.firstName,
              lastName: student.user.lastName,
              email: student.user.email,
            },
          },
        };
      });

      // Calculate stats
      const present = records.filter((r) => r.status === 'PRESENT').length;
      const absent = records.filter((r) => r.status === 'ABSENT').length;
      const late = records.filter((r) => r.status === 'LATE').length;
      const excused = records.filter((r) => r.status === 'EXCUSED').length;
      const attendanceRate = totalStudents > 0 ? (present / totalStudents) * 100 : 0;

      return {
        date: date.toISOString(),
        classId: null,
        totalStudents,
        present,
        absent,
        late,
        excused,
        attendanceRate,
        records,
      };
    }

    // Get all students in the class
    const classStudents = await this.prisma.classStudent.findMany({
      where: {
        classId,
        schoolId,
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    const studentIds = classStudents.map((cs) => cs.studentId);
    const totalStudents = studentIds.length;

    // Get attendance records for the date
    const attendanceRecords = await this.prisma.attendanceRecord.findMany({
      where: this.scopeToSchool(schoolId, {
        date,
        studentId: { in: studentIds },
      }),
      include: {
        student: {
          select: {
            id: true,
            studentNumber: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Create a map of studentId to attendance record
    const attendanceMap = new Map(
      attendanceRecords.map((record) => [record.studentId, record])
    );

    // Build complete records array with all students
    const records = classStudents.map((cs) => {
      const existingRecord = attendanceMap.get(cs.studentId);
      return {
        id: existingRecord?.id || `temp-${cs.studentId}`,
        studentId: cs.studentId,
        date: date.toISOString(),
        status: existingRecord?.status || 'ABSENT',
        remarks: existingRecord?.note || null,
        student: {
          studentNumber: cs.student.studentNumber,
          user: {
            firstName: cs.student.user.firstName,
            lastName: cs.student.user.lastName,
            email: cs.student.user.email,
          },
        },
      };
    });

    // Calculate stats
    const present = records.filter((r) => r.status === 'PRESENT').length;
    const absent = records.filter((r) => r.status === 'ABSENT').length;
    const late = records.filter((r) => r.status === 'LATE').length;
    const excused = records.filter((r) => r.status === 'EXCUSED').length;
    const attendanceRate = totalStudents > 0 ? (present / totalStudents) * 100 : 0;

    return {
      date: date.toISOString(),
      classId,
      totalStudents,
      present,
      absent,
      late,
      excused,
      attendanceRate,
      records,
    };
  }

  // Teacher Attendance Methods
  async bulkUpsertTeacherAttendance(
    schoolId: string,
    date: Date,
    markedById: string,
    records: Array<{
      teacherId: string;
      status: AttendanceStatus;
      note?: string;
      checkInTime?: Date;
      checkOutTime?: Date;
    }>,
  ) {
    const ops = records.map((r) =>
      this.prisma.teacherAttendance.upsert({
        where: { teacherId_date: { teacherId: r.teacherId, date } },
        create: {
          schoolId,
          teacherId: r.teacherId,
          date,
          status: r.status,
          markedById,
          note: r.note,
          checkInTime: r.checkInTime,
          checkOutTime: r.checkOutTime,
        },
        update: {
          status: r.status,
          markedById,
          note: r.note,
          checkInTime: r.checkInTime,
          checkOutTime: r.checkOutTime,
        },
      }),
    );
    return Promise.all(ops);
  }

  async getTeacherDailySummary(schoolId: string, date: Date) {
    // Get all teachers in the school
    const teachers = await this.prisma.teacher.findMany({
      where: {
        schoolId,
        isActive: true,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    const teacherIds = teachers.map((t) => t.id);
    const totalTeachers = teacherIds.length;

    // Get attendance records for the date
    const attendanceRecords = await this.prisma.teacherAttendance.findMany({
      where: this.scopeToSchool(schoolId, {
        date,
        teacherId: { in: teacherIds },
      }),
      include: {
        teacher: {
          select: {
            id: true,
            employeeNum: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Create a map of teacherId to attendance record
    const attendanceMap = new Map(
      attendanceRecords.map((record) => [record.teacherId, record])
    );

    // Build complete records array with all teachers
    const records = teachers.map((teacher) => {
      const existingRecord = attendanceMap.get(teacher.id);
      return {
        id: existingRecord?.id || `temp-${teacher.id}`,
        teacherId: teacher.id,
        date: date.toISOString(),
        status: existingRecord?.status || 'ABSENT',
        checkInTime: existingRecord?.checkInTime?.toISOString() || null,
        checkOutTime: existingRecord?.checkOutTime?.toISOString() || null,
        remarks: existingRecord?.note || null,
        teacher: {
          employeeNum: teacher.employeeNum,
          user: {
            firstName: teacher.user.firstName,
            lastName: teacher.user.lastName,
            email: teacher.user.email,
          },
        },
      };
    });

    // Calculate stats
    const present = records.filter((r) => r.status === 'PRESENT').length;
    const absent = records.filter((r) => r.status === 'ABSENT').length;
    const late = records.filter((r) => r.status === 'LATE').length;
    const excused = records.filter((r) => r.status === 'EXCUSED').length;
    const attendanceRate = totalTeachers > 0 ? (present / totalTeachers) * 100 : 0;

    return {
      date: date.toISOString(),
      totalTeachers,
      present,
      absent,
      late,
      excused,
      attendanceRate,
      records,
    };
  }

  async getTeacherDailyAttendance(schoolId: string, userId: string, date: Date) {
    // Get teacher
    const teacher = await this.prisma.teacher.findFirst({
      where: { schoolId, user: { id: userId } },
    });

    if (!teacher) return [];

    // Get all classes taught by this teacher
    const classIds = await this.prisma.timetableSlot.findMany({
      where: {
        schoolId,
        teacherId: teacher.id,
      },
      select: { classId: true },
      distinct: ['classId'],
    });

    // Get all students in those classes
    const classStudents = await this.prisma.classStudent.findMany({
      where: {
        schoolId,
        classId: {
          in: classIds.map((c) => c.classId),
        },
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        class: {
          select: { name: true },
        },
      },
    });

    // Get attendance records for these students
    const attendanceRecords = await this.prisma.attendanceRecord.findMany({
      where: this.scopeToSchool(schoolId, {
        date,
        studentId: {
          in: classStudents.map((cs) => cs.studentId),
        },
      }),
      include: {
        student: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    // Transform to include student names and class info
    // Return all students with their attendance status (or ABSENT if no record exists)
    const results = classStudents.map((cs) => {
      const attendance = attendanceRecords.find((ar) => ar.studentId === cs.studentId);
      
      return {
        id: attendance?.id || `temp-${cs.studentId}`, // Use temp ID for students without records
        studentId: cs.student.studentNumber,
        studentName: `${cs.student.user.firstName} ${cs.student.user.lastName}`,
        className: cs.class.name,
        status: attendance?.status || 'ABSENT',
        date: attendance?.date || date,
      };
    });
    
    return results;
  }

  async updateAttendanceStatus(schoolId: string, userId: string, recordId: string, status: string) {
    // Check if this is a temp ID (for new records)
    if (recordId.startsWith('temp-')) {
      // Extract studentId from temp ID
      const studentId = recordId.replace('temp-', '');
      
      // Get a default subject (or create one if needed)
      let subject = await this.prisma.subject.findFirst({
        where: { schoolId },
      });
      
      if (!subject) {
        // Create a default "General" subject if none exists
        subject = await this.prisma.subject.create({
          data: {
            schoolId,
            name: 'General',
            code: 'GEN',
          },
        });
      }
      
      // Create a new attendance record
      return this.prisma.attendanceRecord.create({
        data: {
          schoolId,
          studentId,
          subjectId: subject.id,
          date: new Date(),
          status: status as any,
          markedById: userId,
        },
      });
    }
    
    // Update existing record
    return this.prisma.attendanceRecord.update({
      where: { id: recordId, schoolId },
      data: { status: status as any, markedById: userId },
    });
  }
}

