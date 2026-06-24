import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { HealthCheckController } from './health-check.controller';
import { MetricsController } from './metrics.controller';
import { CountriesController } from './countries.controller';

@Module({
  imports: [HttpModule],
  controllers: [HealthCheckController, MetricsController, CountriesController],
})
export class HealthCheckModule {}
