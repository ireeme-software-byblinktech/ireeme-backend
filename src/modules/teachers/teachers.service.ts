import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { TeachersRepository } from './teachers.repository';
import { UsersService } from '../users/users.service';
import { UploadsService } from '../uploads/uploads.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { RoleType } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TeachersService {
  constructor(
    private readonly teachersRepo: TeachersRepository,
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
    private readonly uploadsService: UploadsService,
  ) { }

  findAll(schoolId: string, page?: number, limit?: number) {
    return this.teachersRepo.findAll(schoolId, page, limit);
  }

  async findById(id: string, schoolId: string) {
    const teacher = await this.teachersRepo.findById(id, schoolId);
    if (!teacher) throw new NotFoundException('Teacher not found');
    return teacher;
  }

  async getDetails(userId: string, schoolId: string) {
    const teacher = await this.teachersRepo.findByUserId(userId, schoolId);
    if (!teacher) throw new NotFoundException('Teacher not found');

    return {
      id: teacher.id,
      employeeNum: teacher.employeeNum,
      department: teacher.department,
      qualification: teacher.qualification,
      joiningDate: teacher.joiningDate,
    };
  }

  async getTeacherSubjects(userId: string, schoolId: string) {
    const teacher = await this.teachersRepo.findByUserId(userId, schoolId);
    if (!teacher) throw new NotFoundException('Teacher not found');

    // Get subjects with full teacher data including subjects
    const teacherWithSubjects = await this.prisma.teacher.findFirst({
      where: {
        id: teacher.id,
        schoolId,
      },
      include: {
        subjects: {
          include: {
            subject: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
    });

    if (!teacherWithSubjects) throw new NotFoundException('Teacher not found');

    return {
      subjects: teacherWithSubjects.subjects.map(ts => ({
        id: ts.subject.id,
        name: ts.subject.name,
        code: ts.subject.code,
      })),
    };
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
    return this.teachersRepo.assignSubject(id, subjectId, schoolId);
  }

  async removeSubject(id: string, schoolId: string, subjectId: string) {
    await this.findById(id, schoolId);
    return this.teachersRepo.removeSubject(id, subjectId);
  }

  async deactivate(id: string, schoolId: string) {
    await this.findById(id, schoolId);
    return this.teachersRepo.update(id, { isActive: false });
  }

  async getDashboardStats(userId: string, schoolId: string) {
    const teacher = await this.teachersRepo.findByUserId(userId, schoolId);
    if (!teacher) throw new NotFoundException('Teacher not found');

    // Get total students taught (through timetable slots)
    const classIds = await this.prisma.timetableSlot.findMany({
      where: {
        schoolId,
        teacherId: teacher.id,
      },
      select: { classId: true },
      distinct: ['classId'],
    });

    const totalStudents = await this.prisma.classStudent.count({
      where: {
        schoolId,
        classId: {
          in: classIds.map((c) => c.classId),
        },
      },
    });

    // Get classes today
    const today = new Date();
    const dayOfWeek = today.getDay();

    const classesToday = await this.prisma.timetableSlot.count({
      where: {
        schoolId,
        teacherId: teacher.id,
        dayOfWeek,
      },
    });

    // Get pending grades
    const pendingGrades = await this.prisma.submission.count({
      where: {
        schoolId,
        assignment: {
          teacherId: teacher.id,
        },
        grade: null,
      },
    });

    // Get average attendance (for classes taught by this teacher)
    // Get subjects taught by this teacher
    const subjectIds = await this.prisma.teacherSubject.findMany({
      where: {
        schoolId,
        teacherId: teacher.id,
      },
      select: { subjectId: true },
    });

    const attendanceRecords = await this.prisma.attendanceRecord.findMany({
      where: {
        schoolId,
        subjectId: {
          in: subjectIds.map((s) => s.subjectId),
        },
      },
      select: { status: true },
    });

    const avgAttendance = attendanceRecords.length > 0
      ? Math.round(
          (attendanceRecords.filter((a) => a.status === 'PRESENT').length /
            attendanceRecords.length) *
            100,
        )
      : 0;

    return {
      totalStudents,
      classesToday,
      pendingGrades,
      avgAttendance,
    };
  }

  async getPerformance(userId: string, schoolId: string) {
    const teacher = await this.teachersRepo.findByUserId(userId, schoolId);
    if (!teacher) throw new NotFoundException('Teacher not found');

    // Get all classes taught by this teacher (through timetable slots)
    const timetableSlots = await this.prisma.timetableSlot.findMany({
      where: {
        schoolId,
        teacherId: teacher.id,
      },
      include: {
        class: true,
      },
      distinct: ['classId'],
    });

    const classes = timetableSlots.map((slot) => slot.class);

    const performance = await Promise.all(
      classes.map(async (cls) => {
        // Get average score for the class from assignments by this teacher
        const grades = await this.prisma.grade.findMany({
          where: {
            schoolId,
            submission: {
              assignment: {
                teacherId: teacher.id,
              },
              student: {
                classId: cls.id,
              },
            },
          },
          select: { score: true },
        });

        const averageScore =
          grades.length > 0
            ? Math.round(
                grades.reduce((sum, g) => sum + Number(g.score || 0), 0) / grades.length,
              )
            : 0;

        // Determine trend (simplified - would need historical data for real trend)
        const trend = averageScore >= 75 ? 'up' : averageScore >= 60 ? 'flat' : 'down';
        const needsAttention = averageScore < 60;

        return {
          className: cls.name,
          averageScore,
          trend,
          needsAttention,
        };
      }),
    );

    return { classes: performance };
  }

  async getAssignedClasses(userId: string, schoolId: string) {
    const teacher = await this.teachersRepo.findByUserId(userId, schoolId);
    if (!teacher) throw new NotFoundException('Teacher not found');

    // Get all classes taught by this teacher through timetable slots
    const timetableSlots = await this.prisma.timetableSlot.findMany({
      where: {
        schoolId,
        teacherId: teacher.id,
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      distinct: ['classId'],
    });

    // Return unique classes
    const uniqueClasses = Array.from(
      new Map(timetableSlots.map((slot) => [slot.class.id, slot.class])).values(),
    );

    return { classes: uniqueClasses };
  }

  async getStudents(userId: string, schoolId: string) {
    const teacher = await this.teachersRepo.findByUserId(userId, schoolId);
    if (!teacher) throw new NotFoundException('Teacher not found');

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
    const students = await this.prisma.classStudent.findMany({
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
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        class: {
          select: { name: true },
        },
      },
    });

    // Get grades and attendance for each student
    const studentDetails = await Promise.all(
      students.map(async (cs) => {
        const student = cs.student;

        // Get average grade for this student from this teacher's assignments
        const grades = await this.prisma.grade.findMany({
          where: {
            schoolId,
            submission: {
              assignment: {
                teacherId: teacher.id,
              },
              studentId: student.id,
            },
          },
          select: { score: true },
        });

        const overallGrade =
          grades.length > 0
            ? Math.round(
                grades.reduce((sum, g) => sum + Number(g.score || 0), 0) / grades.length,
              )
            : 0;

        // Get attendance for this student
        const attendanceRecords = await this.prisma.attendanceRecord.findMany({
          where: {
            schoolId,
            studentId: student.id,
          },
          select: { status: true },
        });

        const attendance =
          attendanceRecords.length > 0
            ? Math.round(
                (attendanceRecords.filter((a) => a.status === 'PRESENT').length /
                  attendanceRecords.length) *
                  100,
              )
            : 0;

        // Get subject performance
        const subjectGrades = await this.prisma.grade.findMany({
          where: {
            schoolId,
            submission: {
              assignment: {
                teacherId: teacher.id,
              },
              studentId: student.id,
            },
          },
          include: {
            submission: {
              include: {
                assignment: {
                  include: {
                    subject: {
                      select: { name: true },
                    },
                  },
                },
              },
            },
          },
        });

        const subjectPerformance = subjectGrades.reduce(
          (acc, g) => {
            const subjectName = g.submission.assignment.subject?.name || 'Unknown';
            if (!acc[subjectName]) {
              acc[subjectName] = [];
            }
            acc[subjectName].push(Number(g.score || 0));
            return acc;
          },
          {} as Record<string, number[]>,
        );

        const subjects = Object.entries(subjectPerformance).map(([name, scores]) => ({
          name,
          score: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
          trend: scores.length > 1 && scores[scores.length - 1] > scores[0] ? 'up' : 'down',
        }));

        // Determine support level
        let support = null;
        if (overallGrade < 60) {
          support = 'Critical Support Needed';
        } else if (overallGrade < 70) {
          support = 'Moderate Support Needed';
        } else if (overallGrade < 80) {
          support = 'Minimal Support Needed';
        }

        return {
          id: student.id,
          name: `${student.user.firstName} ${student.user.lastName}`,
          studentId: student.studentNumber || 'N/A',
          grade: cs.class.name,
          overall: overallGrade,
          attendance,
          subjects: subjects.slice(0, 2), // Limit to 2 subjects for display
          support,
          avatar: `${student.user.firstName[0]}${student.user.lastName[0]}`.toUpperCase(),
        };
      }),
    );

    return { students: studentDetails };
  }

  async getTimetable(userId: string, schoolId: string) {
    const teacher = await this.teachersRepo.findByUserId(userId, schoolId);
    if (!teacher) throw new NotFoundException('Teacher not found');

    console.log('[BACKEND LOG] getTimetable - userId:', userId, 'teacherId:', teacher.id);
    
    const result = await this.prisma.timetableUpload.findFirst({
      where: { teacherId: teacher.id },
    });
    
    if (!result) {
      console.log('[BACKEND LOG] getTimetable - no timetable found');
      return null;
    }

    // Extract S3 key from the stored fileUrl
    let fileKey: string | null = null;
    
    if (result.fileUrl) {
      try {
        // For MinIO local URLs: http://localhost:9000/bucket-name/folder/uuid.ext
        // For S3 URLs: https://bucket-name.s3.amazonaws.com/folder/uuid.ext
        const urlObj = new URL(result.fileUrl);
        const pathParts = urlObj.pathname.split('/').filter(p => p);
        
        // Remove bucket name from path (first part for MinIO style, or from host for S3 style)
        if (pathParts.length > 1) {
          fileKey = pathParts.slice(1).join('/'); // Everything after bucket name
        } else if (pathParts.length === 1 && pathParts[0] !== 'blink-campus-files') {
          fileKey = pathParts[0]; // Just the path if no bucket in URL
        }
        
        console.log('[BACKEND LOG] Extracted fileKey from URL:', fileKey);
      } catch (error) {
        console.warn('[BACKEND LOG] Could not extract key from URL:', error);
      }
    }

    // Regenerate fresh signed URL if we have a key
    if (fileKey) {
      try {
        const freshSignedUrl = await this.uploadsService.getSignedUrl(fileKey, true); // inline=true for viewing
        console.log('[BACKEND LOG] Regenerated fresh signed URL for key:', fileKey);
        
        return {
          ...result,
          fileUrl: freshSignedUrl, // Return fresh signed URL
        };
      } catch (error) {
        console.warn('[BACKEND LOG] Failed to regenerate signed URL, using stored URL:', error);
        // Fall back to stored URL if regeneration fails
      }
    }

    console.log('[BACKEND LOG] getTimetable - result:', result);
    return result;
  }

  async uploadTimetable(userId: string, schoolId: string, dto: {
    fileKey: string;
    fileName: string;
    fileType: string;
  }) {
    const teacher = await this.teachersRepo.findByUserId(userId, schoolId);
    if (!teacher) throw new NotFoundException('Teacher not found');

    // Regenerate a fresh signed URL from the key to store temporarily
    // This will be regenerated on each getTimetable request
    const freshSignedUrl = await this.uploadsService.getSignedUrl(dto.fileKey, true); // inline=true for viewing

    // Delete existing timetable upload if any
    await this.prisma.timetableUpload.deleteMany({
      where: { teacherId: teacher.id },
    });

    return this.prisma.timetableUpload.create({
      data: {
        teacherId: teacher.id,
        schoolId,
        fileUrl: freshSignedUrl, // Store initial signed URL (will be regenerated on each fetch)
        fileName: dto.fileName,
        fileType: dto.fileType,
      },
    });
  }

  async deleteTimetable(id: string, userId: string, schoolId: string) {
    const teacher = await this.teachersRepo.findByUserId(userId, schoolId);
    if (!teacher) throw new NotFoundException('Teacher not found');

    return this.prisma.timetableUpload.deleteMany({
      where: {
        id,
        teacherId: teacher.id,
      },
    });
  }

  async getTimetableSlots(userId: string, schoolId: string) {
    const teacher = await this.teachersRepo.findByUserId(userId, schoolId);
    if (!teacher) throw new NotFoundException('Teacher not found');

    // Get timetable slots for this teacher for all days of the week (0-6, Sunday-Saturday)
    const slots = await this.prisma.timetableSlot.findMany({
      where: {
        schoolId,
        teacherId: teacher.id,
      },
      include: {
        class: {
          select: {
            id: true,
            name: true,
          },
        },
        subject: {
          select: {
            name: true,
            code: true,
          },
        },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    return {
      slots: slots.map((slot: any) => ({
        id: slot.id,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        className: slot.class.name,
        classId: slot.class.id,
        subjectName: slot.subject.name,
        subjectCode: slot.subject.code,
        room: slot.room,
      })),
    };
  }
}
