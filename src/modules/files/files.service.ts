import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Response } from 'express';
import axios from 'axios';
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
    const url = await this.uploadsService.getSignedUrl(key, false); // Get download URL
    return { key, url };
  }

  /**
   * Proxies file from S3/MinIO with correct inline headers
   * This ensures PDFs and images open in browser instead of downloading
   * Accepts either a file key (e.g., uploads/uuid.pdf) or a full signed URL
   */
  async viewFileInline(keyOrUrl: string, res: Response, inline: boolean = true) {
    try {
      let actualKey = keyOrUrl;
      let url: string;

      // Check if input is a full URL or just a key
      if (keyOrUrl.startsWith('http://') || keyOrUrl.startsWith('https://')) {
        // It's a full URL, use it directly
        url = keyOrUrl;
        
        // Extract the key from URL for filename
        try {
          const urlObj = new URL(keyOrUrl);
          const pathParts = urlObj.pathname.split('/').filter(p => p);
          if (pathParts.length > 1) {
            actualKey = pathParts.slice(1).join('/'); // Everything after bucket name
          }
        } catch (e) {
          actualKey = keyOrUrl.split('/').pop() || 'file';
        }
      } else {
        // It's a key, get signed URL from uploads service
        url = await this.uploadsService.getSignedUrl(keyOrUrl, true);
        actualKey = keyOrUrl;
      }

      // Fetch file from S3/MinIO
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 30000,
        validateStatus: () => true, // Accept all status codes
      });

      if (response.status !== 200) {
        console.error(`Failed to fetch file from URL: ${response.status}`);
        throw new BadRequestException('File not found');
      }

      // Determine MIME type from file extension
      const ext = actualKey.split('.').pop()?.toLowerCase();
      const mimeTypes: Record<string, string> = {
        pdf: 'application/pdf',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        webp: 'image/webp',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      };

      const mimeType = mimeTypes[ext || ''] || 'application/octet-stream';
      const fileName = actualKey.split('/').pop() || 'file';

      // Set response headers for inline viewing
      res.setHeader('Content-Type', mimeType);
      res.setHeader(
        'Content-Disposition',
        inline ? `inline; filename="${fileName}"` : `attachment; filename="${fileName}"`,
      );
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.setHeader('Content-Length', response.data.length);

      // Send file data
      res.send(response.data);
    } catch (error: any) {
      console.error('Error viewing file:', error.message);
      throw new BadRequestException('Failed to fetch file');
    }
  }
}
