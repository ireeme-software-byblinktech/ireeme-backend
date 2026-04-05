import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Inject, Optional, LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { QUEUE_EMAILS } from '../queues.module';

export interface EmailJobData {
  to: string;
  subject: string;
  html: string;
}

@Processor(QUEUE_EMAILS)
@Injectable()
export class EmailsProcessor extends WorkerHost {
  constructor(
    @Optional() @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {
    super();
  }

  async process(job: Job<EmailJobData>): Promise<void> {
    // STUB → Sprint 2: wire up nodemailer/SMTP here
    this.logger?.log(
      `[STUB] Email queued to ${job.data.to}: ${job.data.subject}`,
      EmailsProcessor.name,
    );
  }
}
