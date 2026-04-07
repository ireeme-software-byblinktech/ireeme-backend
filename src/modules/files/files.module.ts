import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { FileProcessingProcessor } from '../../queues/processors/file-processing.processor';
import { QUEUE_FILE_PROCESSING } from '../../queues/queues.module';

@Module({
  imports: [BullModule.registerQueue({ name: QUEUE_FILE_PROCESSING })],
  controllers: [FilesController],
  providers: [FilesService, FileProcessingProcessor],
  exports: [FilesService],
})
export class FilesModule {}
