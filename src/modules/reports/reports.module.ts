import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { QUEUE_REPORTS } from '../../queues/queues.module';

@Module({
  imports: [BullModule.registerQueue({ name: QUEUE_REPORTS })],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
