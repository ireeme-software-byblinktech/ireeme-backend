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
    const config = this.app.get(ConfigService);
    let redisUrl = config.get<string>('REDIS_URL');
    const redisHost = config.get('REDIS_HOST');
    
    if (redisHost && redisHost.startsWith('redis://')) {
      redisUrl = redisHost;
    }
    
    let pubClient: Redis;
    if (redisUrl) {
      pubClient = new Redis(redisUrl);
    } else {
      const host = redisHost;
      const port = config.get<number>('REDIS_PORT');
      const password = config.get<string>('REDIS_PASSWORD');
      pubClient = new Redis({ host, port, ...(password ? { password } : {}) });
    }
    
    const subClient = pubClient.duplicate();

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}
