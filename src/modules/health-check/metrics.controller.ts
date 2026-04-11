import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MetricsService } from '../../common/services/metrics.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { RoleType } from '@prisma/client';

@ApiTags('metrics')
@Controller('metrics')
@UseGuards(RolesGuard)
@ApiBearerAuth()
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get()
  @Roles(RoleType.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get application metrics (Super Admin only)' })
  getMetrics() {
    return {
      timestamp: new Date().toISOString(),
      metrics: this.metricsService.getAllMetrics(),
      process: {
        uptime: process.uptime(),
        memory: {
          heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
          rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
          external: `${Math.round(process.memoryUsage().external / 1024 / 1024)}MB`,
        },
        cpu: process.cpuUsage(),
      },
    };
  }
}
