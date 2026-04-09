import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUE_REPORTS } from '../queues.module';

@Processor(QUEUE_REPORTS)
export class ReportCardProcessor extends WorkerHost {
  private readonly logger = new Logger(ReportCardProcessor.name);

  async process(job: Job<any, any, string>): Promise<any> {
    if (job.name === 'generate-report-card') {
      this.logger.log(
        `PDF job queued for student ${job.data.studentId} (term: ${job.data.termId})`,
      );
      // Sprint 2 will implement actual PDF generation using @pdf-lib
      return { status: 'queued', message: 'PDF generation will be implemented in Sprint 2' };
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} failed: ${error.message}`);
  }
}
