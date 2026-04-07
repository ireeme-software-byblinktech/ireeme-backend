import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Inject, Optional, LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { QUEUE_FILE_PROCESSING } from '../queues.module';
import { UploadsService } from '../../modules/uploads/uploads.service';

export interface AntivirusScanJobData {
  key: string;
  schoolId: string;
  userId: string;
}

/**
 * STUB → Sprint 2: wire up ClamAV here.
 * For now marks every file as CLEAN after a simulated scan.
 */
@Processor(QUEUE_FILE_PROCESSING)
@Injectable()
export class FileProcessingProcessor extends WorkerHost {
  constructor(
    private readonly uploadsService: UploadsService,
    @Optional() @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {
    super();
  }

  async process(job: Job<AntivirusScanJobData>): Promise<void> {
    const { key } = job.data;

    this.logger?.log(
      `[STUB] Antivirus scan queued for key: ${key} — marking CLEAN (ClamAV Sprint 2)`,
      FileProcessingProcessor.name,
    );

    // Sprint 2: replace with actual ClamAV scan
    await this.uploadsService.updateScanStatus(key, 'CLEAN');
  }
}
