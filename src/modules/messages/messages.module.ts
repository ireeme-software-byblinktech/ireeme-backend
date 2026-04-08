import { Module } from '@nestjs/common';
import { MessagesGateway } from './messages.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [MessagesGateway],
})
export class MessagesModule {}
