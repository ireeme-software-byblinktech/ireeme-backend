import { Module, Global } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { LocalStorageService } from './local-storage.service';

@Global()
@Module({
  providers: [UploadsService, LocalStorageService],
  exports: [UploadsService],
})
export class UploadsModule {}
