/// <reference types="multer" />
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../database/prisma.service';

// Allowed MIME types and their magic bytes (first N bytes)
const ALLOWED_TYPES: Record<string, { magic: number[]; ext: string }> = {
  'application/pdf': { magic: [0x25, 0x50, 0x44, 0x46], ext: 'pdf' },
  'image/jpeg': { magic: [0xff, 0xd8, 0xff], ext: 'jpg' },
  'image/png': { magic: [0x89, 0x50, 0x4e, 0x47], ext: 'png' },
  'image/gif': { magic: [0x47, 0x49, 0x46, 0x38], ext: 'gif' },
  'image/webp': { magic: [0x52, 0x49, 0x46, 0x46], ext: 'webp' },
  'application/msword': { magic: [0xd0, 0xcf, 0x11, 0xe0], ext: 'doc' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    magic: [0x50, 0x4b, 0x03, 0x04],
    ext: 'docx',
  },
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

@Injectable()
export class UploadsService {
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.bucket = config.get<string>('AWS_S3_BUCKET_NAME')!;

    this.s3 = new S3Client({
      region: config.get<string>('AWS_REGION', 'us-east-1'),
      credentials: {
        accessKeyId: config.get<string>('AWS_ACCESS_KEY_ID')!,
        secretAccessKey: config.get<string>('AWS_SECRET_ACCESS_KEY')!,
      },
      // In dev this points to MinIO; in prod this key is absent
      ...(config.get('AWS_ENDPOINT')
        ? {
            endpoint: config.get<string>('AWS_ENDPOINT'),
            forcePathStyle: true, // required for MinIO
          }
        : {}),
    });
  }

  /**
   * Validates MIME type (declared + magic bytes) and file size,
   * uploads to S3/MinIO under a UUID key, and records the file in DB.
   */
  async upload(file: Express.Multer.File, schoolId: string, folder = 'uploads'): Promise<string> {
    this.validateSize(file);
    const mimeType = this.validateMime(file);

    const ext = ALLOWED_TYPES[mimeType].ext;
    const key = `${folder}/${uuidv4()}.${ext}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: mimeType,
        // Force download — never render user content inline
        ContentDisposition: 'attachment',
      }),
    );

    // Record in DB for audit / cleanup
    await this.prisma.uploadedFile.create({
      data: { schoolId, key, bucket: this.bucket, mimeType },
    });

    return key;
  }

  /** Returns a short-lived pre-signed URL (15 min) */
  async getSignedUrl(key: string): Promise<string> {
    return getSignedUrl(this.s3, new GetObjectCommand({ Bucket: this.bucket, Key: key }), {
      expiresIn: 900,
    });
  }

  async delete(key: string): Promise<void> {
    await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
    await this.prisma.uploadedFile.deleteMany({ where: { key } });
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private validateSize(file: Express.Multer.File): void {
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(`File too large. Max size is ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }
  }

  private validateMime(file: Express.Multer.File): string {
    const declared = file.mimetype;

    if (!ALLOWED_TYPES[declared]) {
      throw new BadRequestException(`File type '${declared}' is not allowed`);
    }

    // Magic bytes check — validate actual content, not just the declared MIME
    const magic = ALLOWED_TYPES[declared].magic;
    const header = Array.from(file.buffer.slice(0, magic.length));
    const matches = magic.every((byte, i) => header[i] === byte);

    if (!matches) {
      throw new BadRequestException('File content does not match declared type');
    }

    return declared;
  }
}
