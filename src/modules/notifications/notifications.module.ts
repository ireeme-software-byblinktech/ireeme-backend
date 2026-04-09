import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsProcessor } from '../../queues/processors/notifications.processor';
import { EmailsProcessor } from '../../queues/processors/emails.processor';
import { QUEUE_NOTIFICATIONS, QUEUE_EMAILS } from '../../queues/queues.module';
import { JwtService } from '@nestjs/jwt';

@Global()
@Module({
  imports: [BullModule.registerQueue({ name: QUEUE_NOTIFICATIONS }, { name: QUEUE_EMAILS })],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsGateway,
    NotificationsProcessor,
    EmailsProcessor,
    JwtService
  ],
  exports: [NotificationsService, NotificationsGateway],
})
export class NotificationsModule {}
