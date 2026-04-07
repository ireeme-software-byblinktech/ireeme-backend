import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { BaseRepository } from '../../database/base.repository';

@Injectable()
export class TimetableRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findByClass(classId: string) {
    return this.prisma.timetableSlot.findMany({
      where: { classId },
      include: {
        subject: { select: { name: true, code: true } },
        teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  findByTeacher(teacherId: string) {
    return this.prisma.timetableSlot.findMany({
      where: { teacherId },
      include: { subject: true, class: { select: { name: true } } },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
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

  delete(id: string) {
    return this.prisma.timetableSlot.delete({ where: { id } });
  }
}
