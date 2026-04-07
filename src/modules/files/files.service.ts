import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { UploadsService } from '../uploads/uploads.service';
import { QUEUE_FILE_PROCESSING } from '../../queues/queues.module';
import { AntivirusScanJobData } from '../../queues/processors/file-processing.processor';

@Injectable()
export class FilesService {
  constructor(
    private readonly uploadsService: UploadsService,
    @InjectQueue(QUEUE_FILE_PROCESSING) private readonly fileQueue: Queue,
  ) {}

  async upload(file: Express.Multer.File, schoolId: string, userId: string) {
    const result = await this.uploadsService.upload(file, schoolId, userId);

    // Queue antivirus scan — non-blocking
    const jobData: AntivirusScanJobData = { key: result.key, schoolId, userId };
    await this.fileQueue.add('antivirus-scan', jobData, { attempts: 3, priority: 2 });

    return result;
  }

  async getPresignedUrl(key: string) {
    const url = await this.uploadsService.getSignedUrl(key);
    return { key, url };
  }
}
