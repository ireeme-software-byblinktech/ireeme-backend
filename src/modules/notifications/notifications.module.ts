import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsProcessor } from '../../queues/processors/notifications.processor';
import { EmailsProcessor } from '../../queues/processors/emails.processor';
import { QUEUE_NOTIFICATIONS, QUEUE_EMAILS } from '../../queues/queues.module';

@Global()
@Module({
  imports: [BullModule.registerQueue({ name: QUEUE_NOTIFICATIONS }, { name: QUEUE_EMAILS })],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsProcessor, EmailsProcessor],
  exports: [NotificationsService],
})
export class NotificationsModule {}
