import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';

export const QUEUE_NOTIFICATIONS = 'notifications';
export const QUEUE_REPORTS = 'reports';
export const QUEUE_FILE_PROCESSING = 'file-processing';
export const QUEUE_EMAILS = 'emails';
export const QUEUE_AI_CHAT = 'ai-chat';
export const QUEUE_CLEANUP = 'cleanup';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST'),
          port: config.get<number>('REDIS_PORT'),
          ...(config.get('REDIS_PASSWORD') ? { password: config.get('REDIS_PASSWORD') } : {}),
          skipVersionCheck: true,
        },
      }),
    }),
    BullModule.registerQueue(
      { name: QUEUE_NOTIFICATIONS },
      { name: QUEUE_REPORTS },
      { name: QUEUE_FILE_PROCESSING },
      { name: QUEUE_EMAILS },
      { name: QUEUE_AI_CHAT },
      { name: QUEUE_CLEANUP },
    ),
  ],
  exports: [BullModule],
})
export class QueuesModule {}
