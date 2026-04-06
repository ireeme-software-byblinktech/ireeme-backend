import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Inject, Optional, LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { PrismaService } from '../../database/prisma.service';
import { QUEUE_NOTIFICATIONS } from '../queues.module';
import { NotificationType } from '@prisma/client';

export interface NotificationJobData {
  userId: string;
  schoolId: string;
  title: string;
  body: string;
  type: NotificationType;
}

@Processor(QUEUE_NOTIFICATIONS)
@Injectable()
export class NotificationsProcessor extends WorkerHost {
  constructor(
    private readonly prisma: PrismaService,
    @Optional()
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {
    super();
  }

  async process(job: Job<NotificationJobData>): Promise<void> {
    const { userId, schoolId, title, body, type } = job.data;

    await this.prisma.notification.create({
      data: { userId, schoolId, title, body, type },
    });

    this.logger?.log(
      `Notification created for user ${userId}: ${title}`,
      NotificationsProcessor.name,
    );
  }
}
