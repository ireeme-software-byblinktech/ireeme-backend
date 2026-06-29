import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import Redis from 'ioredis';
import { INestApplicationContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  constructor(private app: INestApplicationContext) {
    super(app);
  }

  async connectToRedis(): Promise<void> {
    try {
      const config = this.app.get(ConfigService);
      let redisUrl = config.get<string>('REDIS_URL');
      const redisHost = config.get('REDIS_HOST');

      if (redisHost && redisHost.startsWith('redis://')) {
        redisUrl = redisHost;
      }

      let pubClient: Redis;
      const redisOptions = {
        maxRetriesPerRequest: 0,
        retryStrategy: () => null, // Don't retry
        lazyConnect: true,
      };

      if (redisUrl) {
        pubClient = new Redis(redisUrl, redisOptions);
      } else {
        const host = redisHost;
        const port = config.get<number>('REDIS_PORT');
        const password = config.get<string>('REDIS_PASSWORD');
        pubClient = new Redis({ host, port, ...(password ? { password } : {}), ...redisOptions });
      }

      const subClient = pubClient.duplicate();

      // Wait for Redis connection with timeout
      const connectionTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Redis connection timeout')), 2000)
      );

      await Promise.race([
        Promise.all([
          new Promise((resolve) => pubClient.on('connect', resolve)),
          new Promise((resolve) => subClient.on('connect', resolve))
        ]),
        connectionTimeout
      ]);

      this.adapterConstructor = createAdapter(pubClient, subClient);
    } catch (error) {
      console.warn('[Redis] Failed to connect, will not use Redis adapter:', error.message);
      // If Redis fails, just don't set up the adapter - Socket.IO will work without it
    }
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    if (this.adapterConstructor) {
      server.adapter(this.adapterConstructor);
    }
    return server;
  }
}
