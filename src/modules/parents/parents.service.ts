import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreatePermissionDto } from './dto/create-permission.dto';

@Injectable()
export class ParentsService {
  constructor(private prisma: PrismaService) {}

  async getParentByUserId(userId: string) {
    const parent = await this.prisma.parent.findUnique({
      where: { userId },
    });
    if (!parent) throw new NotFoundException('Parent profile not found');
    return parent;
  }

  async getChildren(userId: string) {
    const parent = await this.getParentByUserId(userId);
    
    const relations = await this.prisma.parentStudent.findMany({
      where: { parentId: parent.id, verified: true },
      include: {
        student: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
            classes: {
              include: {
                class: true,
              },
              where: {
                class: {
                  term: {
                    isActive: true,
                  },
                },
              },
              take: 1,
            },
          },
        },
      },
    });

    return relations.map((r) => ({
      studentId: r.studentId,
      firstName: r.student.user.firstName,
      lastName: r.student.user.lastName,
      avatarUrl: r.student.user.avatarUrl,
      className: r.student.classes[0]?.class?.name || 'N/A',
      studentNumber: r.student.studentNumber,
    }));
  }

  async getChildOverview(studentId: string) {
    const [grades, attendance, behavior] = await Promise.all([
      this.prisma.grade.findMany({
        where: { studentId },
        include: {
          subject: { select: { name: true } },
          term: { select: { name: true } },
        },
        orderBy: { gradedAt: 'desc' },
        take: 5,
      }),
      this.prisma.attendanceRecord.findMany({
        where: { studentId },
        orderBy: { date: 'desc' },
        take: 10,
      }),
      this.prisma.disciplineCase.findMany({
        where: { studentId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    return { grades, attendance, behavior };
  }

  async getChildFees(studentId: string) {
    return this.prisma.feeRecord.findMany({
      where: { studentId },
      include: {
        term: { select: { name: true } },
        transactions: {
          orderBy: { paidAt: 'desc' },
        },
      },
    });
  }

  async submitPermission(userId: string, studentId: string, dto: CreatePermissionDto) {
    const parent = await this.getParentByUserId(userId);
    
    // Safety check just in case (though guard should handle it)
    const relation = await this.prisma.parentStudent.findUnique({
      where: {
        parentId_studentId: {
          parentId: parent.id,
          studentId,
        },
      },
    });

    if (!relation || !relation.verified) {
      throw new ForbiddenException('Not authorized to submit permission for this student');
    }

    return this.prisma.permissionRequest.create({
      data: {
        schoolId: parent.schoolId,
        studentId,
        reason: dto.reason,
        fromDate: new Date(dto.fromDate),
        toDate: new Date(dto.toDate),
        status: 'PENDING',
      },
    });
  }
}
