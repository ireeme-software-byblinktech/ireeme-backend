import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { BaseRepository } from '../../database/base.repository';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

@Injectable()
export class TimetableRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findByClass(schoolId: string, classId: string) {
    return this.prisma.timetableSlot.findMany({
      where: this.scopeToSchool(schoolId, { classId }),
      include: {
        subject: { select: { name: true, code: true } },
        teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  findByTeacher(schoolId: string, teacherId: string) {
    return this.prisma.timetableSlot.findMany({
      where: this.scopeToSchool(schoolId, { teacherId }),
      include: {
        subject: { select: { name: true, code: true } },
        class: { select: { name: true } },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  async findByStudent(schoolId: string, studentId: string) {
    const student = await this.prisma.student.findFirst({
      where: this.scopeToSchool(schoolId, { id: studentId }),
      select: { classId: true },
    });

    if (!student?.classId) return [];

    return this.findByClass(schoolId, student.classId);
  }

  exists(schoolId: string, where: any) {
    return this.prisma.timetableSlot.findFirst({
      where: this.scopeToSchool(schoolId, where),
    });
  }

  create(data: {
    schoolId: string;
    classId: string;
    subjectId: string;
    teacherId: string;
    dayOfWeek: number;
    startTime: string;
    room?: string;
  }) {
    return this.prisma.timetableSlot.create({ data });
  }

  delete(schoolId: string, id: string) {
    return this.prisma.timetableSlot.deleteMany({
      where: this.scopeToSchool(schoolId, { id }),
    });
  }
}
