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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { RoleType } from '@prisma/client';
import { FilesService } from './files.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('files')
@ApiBearerAuth()
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) { }

  /**
   * POST /files/upload
   * Accepts multipart/form-data with a single file field named "file".
   * Returns the S3 key and a 15-min pre-signed URL.
   */
  @Post('upload')
  @Roles(RoleType.SCHOOL_ADMIN, RoleType.TEACHER, RoleType.DISCIPLINE_OFFICER, RoleType.NURSE)
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
    @CurrentUser() user: JwtPayload | undefined,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file provided');
    // For public uploads (setup), use default values
    const schoolId: string = user?.schoolId ?? '1';
    const userId: string = user?.sub ?? '1';
    return this.filesService.upload(file, schoolId, userId);
  }

  /**
   * GET /files/:key/url
   * Returns a fresh 15-min pre-signed URL for an existing file key.
   */
  @Get(':key/url')
  @Roles(RoleType.SCHOOL_ADMIN, RoleType.TEACHER, RoleType.DISCIPLINE_OFFICER, RoleType.NURSE)
  @ApiOperation({ summary: 'Get a pre-signed download URL for a file (15 min expiry)' })
  getPresignedUrl(@Param('key') key: string) {
    return this.filesService.getPresignedUrl(key);
  }
}
