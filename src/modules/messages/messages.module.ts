import { Module } from '@nestjs/common';
import { MessagesGateway } from './messages.gateway';
import { MessagesService } from './messages.service';
import { MessagesRepository } from './messages.repository';
import { MessagesController } from './messages.controller';
import { AuthModule } from '../auth/auth.module';
import { UploadsModule } from '../uploads/uploads.module';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [AuthModule, UploadsModule, DatabaseModule],
  controllers: [MessagesController],
  providers: [
    MessagesGateway,
    MessagesService,
    MessagesRepository,
  ],
  exports: [MessagesService],
})
export class MessagesModule {}
