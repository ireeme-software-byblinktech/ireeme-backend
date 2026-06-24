import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redisUrl = config.get<string>('REDIS_URL');
        if (redisUrl) {
          return new Redis(redisUrl);
        }
        const password = config.get<string>('REDIS_PASSWORD');
        return new Redis({
          host: config.get('REDIS_HOST'),
          port: config.get<number>('REDIS_PORT'),
          ...(password ? { password } : {}),
        });
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
