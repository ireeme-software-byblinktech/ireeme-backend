import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiRepository } from './ai.repository';
import { AiController } from './ai.controller';

@Module({
  controllers: [AiController],
  providers: [AiService, AiRepository],
  exports: [AiService],
})
export class AiModule {}
