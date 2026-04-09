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
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['ok', 'degraded'],
          example: 'ok',
        },
        timestamp: {
          type: 'string',
          format: 'date-time',
          example: '2026-04-09T20:00:00.000Z',
        },
        services: {
          type: 'object',
          properties: {
            database: {
              type: 'string',
              enum: ['up', 'down'],
              example: 'up',
            },
            redis: {
              type: 'string',
              enum: ['up', 'down'],
              example: 'up',
            },
          },
        },
      },
    },
  })
  async check() {
    let dbStatus: 'up' | 'down' = 'down';
    let redisStatus: 'up' | 'down' = 'down';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbStatus = 'up';
    } catch {
      dbStatus = 'down';
    }

    try {
      const result = await this.redis.ping();
      redisStatus = result === 'PONG' ? 'up' : 'down';
    } catch {
      redisStatus = 'down';
    }

    const status = dbStatus === 'up' && redisStatus === 'up' ? 'ok' : 'degraded';

    return {
      status,
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        redis: redisStatus,
      },
    };
  }
}
