import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../../database/prisma.service';
import { REDIS_CLIENT } from '../../config/redis.module';
import { Public } from '../../common/decorators/public.decorator';
import Redis from 'ioredis';

@ApiTags('health-check')
@Controller('health')
export class HealthCheckController {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) { }

  @Get()
  @Public()
  @ApiOperation({ summary: 'System health check: DB + Redis connectivity' })
  @ApiResponse({
    status: 200,
    description: 'Health check result',
  })
  async check() {
    let dbStatus: 'up' | 'down' = 'down';
    let redisStatus: 'up' | 'down' = 'down';
    let dbLatency = 0;
    let redisLatency = 0;

    // Database health check
    try {
      const start = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      dbLatency = Date.now() - start;
      dbStatus = 'up';
    } catch {
      dbStatus = 'down';
    }

    // Redis health check
    try {
      const start = Date.now();
      const result = await this.redis.ping();
      redisLatency = Date.now() - start;
      redisStatus = result === 'PONG' ? 'up' : 'down';
    } catch {
      redisStatus = 'down';
    }

    const status = dbStatus === 'up' && redisStatus === 'up' ? 'ok' : 'degraded';

    return {
      status,
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: dbStatus,
          latency: `${dbLatency}ms`,
        },
        redis: {
          status: redisStatus,
          latency: `${redisLatency}ms`,
        },
      },
      uptime: process.uptime(),
      memory: {
        used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
      },
    };
  }

  @Get('ready')
  @Public()
  @ApiOperation({ summary: 'Readiness probe for Kubernetes' })
  async readiness() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      await this.redis.ping();
      return { status: 'ready' };
    } catch (error) {
      return { status: 'not ready', error: error.message };
    }
  }

  @Get('live')
  @Public()
  @ApiOperation({ summary: 'Liveness probe for Kubernetes' })
  liveness() {
    return { status: 'alive', timestamp: new Date().toISOString() };
  }
}
