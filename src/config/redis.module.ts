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
        let redisUrl = config.get<string>('REDIS_URL');
        const redisHost = config.get('REDIS_HOST');
        
        // If host looks like a URL, use it as URL
        if (redisHost && redisHost.startsWith('redis://')) {
          redisUrl = redisHost;
        }
        
        if (redisUrl) {
          return new Redis(redisUrl);
        }
        
        const password = config.get<string>('REDIS_PASSWORD');
        return new Redis({
          host: redisHost,
          port: config.get<number>('REDIS_PORT'),
          ...(password ? { password } : {}),
        });
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
