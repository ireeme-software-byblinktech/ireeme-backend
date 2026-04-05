import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../../database/prisma.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsListener {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  @OnEvent('grade.posted')
  async onGradePosted(payload: { studentId: string; gradeId: string; score: number }) {
    const student = await this.prisma.student.findUnique({
      where: { id: payload.studentId },
      select: { userId: true, schoolId: true },
    });
    if (!student) return;

    await this.notificationsService.send({
      userId: student.userId,
      schoolId: student.schoolId,
      title: 'Grade Posted',
      body: `Your assignment has been graded. Score: ${payload.score}`,
      type: NotificationType.GRADE,
    });
  }

  @OnEvent('submission.created')
  async onSubmissionCreated(payload: { studentId: string; assignmentId: string; submissionId: string }) {
    const student = await this.prisma.student.findUnique({
      where: { id: payload.studentId },
      select: { userId: true, schoolId: true },
    });
    if (!student) return;

    await this.notificationsService.send({
      userId: student.userId,
      schoolId: student.schoolId,
      title: 'Submission Received',
      body: 'Your assignment submission was received successfully.',
      type: NotificationType.ASSIGNMENT,
    });
  }

  @OnEvent('attendance.marked')
  async onAttendanceMarked(payload: { studentId: string; schoolId: string; status: string; date: string }) {
    const student = await this.prisma.student.findUnique({
      where: { id: payload.studentId },
      select: { userId: true },
    });
    if (!student) return;

    if (payload.status === 'ABSENT') {
      await this.notificationsService.send({
        userId: student.userId,
        schoolId: payload.schoolId,
        title: 'Attendance Recorded',
        body: `You were marked absent on ${payload.date}.`,
        type: NotificationType.ATTENDANCE,
      });
    }
  }
}
