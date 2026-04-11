import { Module } from '@nestjs/common';
import { HealthCheckController } from './health-check.controller';
import { MetricsController } from './metrics.controller';

@Module({
  controllers: [HealthCheckController, MetricsController],
})
export class HealthCheckModule {}
