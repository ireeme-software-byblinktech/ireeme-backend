import {
  Controller,
  Post,
  Get,
  Param,
  UploadedFile,
  UseInterceptors,
  HttpCode,
  HttpStatus,
  BadRequestException,
  Res,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { Response } from 'express';
import { FilesService } from './files.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('files')
@ApiBearerAuth()
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  /**
   * POST /files/upload
   * Accepts multipart/form-data with a single file field named "file".
   * Returns the S3 key and a 15-min pre-signed URL.
   */
  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(), // keep in memory for magic bytes check
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB hard limit at Multer level
    }),
  )
  @ApiOperation({ summary: 'Upload a file to S3/MinIO (MIME + magic bytes validated, 10MB max)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  async upload(
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file provided');
    return this.filesService.upload(file, user.schoolId!, user.sub);
  }

  /**
   * GET /files/:key/url
   * Returns a fresh 15-min pre-signed URL for an existing file key.
   */
  @Get(':key/url')
  @ApiOperation({ summary: 'Get a pre-signed download URL for a file (15 min expiry)' })
  getPresignedUrl(@Param('key') key: string) {
    return this.filesService.getPresignedUrl(key);
  }

  /**
   * GET /files/view/*
   * Proxies the file from S3/MinIO with Content-Disposition: inline
   * This allows PDFs and images to open in the browser instead of downloading
   * The wildcard captures the full file key including subdirectories
   */
  @Get('view/*')
  @Public() // Allow unauthenticated access for files with valid keys
  @ApiOperation({ summary: 'View a file inline (PDF/image opens in browser)' })
  async viewFile(
    @Param('0') key: string,
    @Res() res: Response,
    @Query('inline') inline: string = 'true',
  ) {
    return this.filesService.viewFileInline(key, res, inline === 'true');
  }
}

