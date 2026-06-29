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
        try {
          let redisUrl = config.get<string>('REDIS_URL');
          const redisHost = config.get('REDIS_HOST');

          const redisOptions = {
            maxRetriesPerRequest: 0,
            retryStrategy: () => null,
            lazyConnect: true,
          };

          // If host looks like a URL, use it
          if (redisHost && redisHost.startsWith('redis://')) {
            redisUrl = redisHost;
          }

          let client: Redis | null = null;
          if (redisUrl) {
            client = new Redis(redisUrl, redisOptions);
          } else if (redisHost) {
            const password = config.get<string>('REDIS_PASSWORD');
            client = new Redis({
              host: redisHost,
              port: config.get<number>('REDIS_PORT'),
              ...(password ? { password } : {}),
              ...redisOptions
            });
          }

          if (client) {
            // Test connection
            client.on('connect', () => console.log('[Redis] Connected successfully!'));
            client.on('error', (err) => {
              console.error('[Redis] Connection error:', err.message);
              // Don't spam error logs
            });
            return client;
          }

          // No Redis config, return null
          console.log('[Redis] No config found, Redis client not initialized');
          return null;
        } catch (error) {
          console.warn('[Redis] Failed to initialize Redis client:', error.message);
          return null;
        }
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
