import { Injectable, Inject } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../database/prisma.service';
import { QUEUE_NOTIFICATIONS, QUEUE_EMAILS } from '../../queues/queues.module';
import { NotificationType } from '@prisma/client';
import { NotificationJobData } from '../../queues/processors/notifications.processor';
import { EmailJobData } from '../../queues/processors/emails.processor';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(QUEUE_NOTIFICATIONS) private readonly notifQueue: Queue,
    @InjectQueue(QUEUE_EMAILS) private readonly emailQueue: Queue,
  ) {}

  /** Queue a notification — non-blocking */
  async send(data: NotificationJobData): Promise<void> {
    await this.notifQueue.add('send-notification', data, { attempts: 3, backoff: { type: 'exponential', delay: 1000 } });
  }

  /** Queue an email — non-blocking */
  async sendEmail(data: EmailJobData): Promise<void> {
    await this.emailQueue.add('send-email', data, { attempts: 3 });
  }

  async findAll(userId: string, page = 1, limit = 25) {
    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async markAllRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async markOneRead(id: string, userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  unreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({ where: { userId, isRead: false } });
  }
}
