import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../database/prisma.service';
import { REDIS_CLIENT } from '../../config/redis.module';
import { Public } from '../../common/decorators/public.decorator';
import Redis from 'ioredis';

@ApiTags('system')
@Controller('health')
export class HealthCheckController {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'System health check: DB + Redis connectivity' })
  async check() {
    const checks = await Promise.allSettled([this.prisma.$queryRaw`SELECT 1`, this.redis.ping()]);

    const db = checks[0].status === 'fulfilled' ? 'ok' : 'error';
    const cache = checks[1].status === 'fulfilled' ? 'ok' : 'error';
    const status = db === 'ok' && cache === 'ok' ? 'ok' : 'degraded';

    return {
      status,
      timestamp: new Date().toISOString(),
      services: { database: db, redis: cache },
    };
  }
}
