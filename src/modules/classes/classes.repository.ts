import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { BaseRepository } from '../../database/base.repository';

@Injectable()
export class ClassesRepository extends BaseRepository {
  constructor(prisma: PrismaService) {
    super(prisma);
  }

  findAll(schoolId: string) {
    return this.prisma.class.findMany({
      where: this.scopeToSchool(schoolId),
      include: { term: { select: { name: true } }, _count: { select: { classStudents: true } } },
    });
  }

  findById(id: string, schoolId: string) {
    return this.prisma.class.findFirst({
      where: this.scopeToSchool(schoolId, { id }),
      include: {
        classStudents: { include: { student: { include: { user: { select: { firstName: true, lastName: true } } } } } },
        subjects: true,
        timetableSlots: {
          include: {
            subject: true,
            teacher: { include: { user: { select: { firstName: true, lastName: true } } } },
          },
        },
      },
    });
  }

  create(data: { schoolId: string; name: string; year: number; stream?: string; termId: string }) {
    return this.prisma.class.create({ data });
  }

  update(
    id: string,
    data: Partial<{ name: string; year: number; stream: string; termId: string }>,
  ) {
    return this.prisma.class.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.class.delete({ where: { id } });
  }

  addStudent(classId: string, studentId: string, schoolId: string) {
    return this.prisma.classStudent.create({
      data: { classId, studentId, schoolId },
    });
  }

  removeStudent(classId: string, studentId: string) {
    return this.prisma.classStudent.delete({
      where: { classId_studentId: { classId, studentId } },
    });
  }
}
