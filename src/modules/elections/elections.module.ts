import { Module } from '@nestjs/common';
import { ElectionsService } from './elections.service';
import { ElectionsController } from './elections.controller';
import { ElectionsRepository } from './elections.repository';

@Module({
  controllers: [ElectionsController],
  providers: [ElectionsService, ElectionsRepository],
  exports: [ElectionsService, ElectionsRepository],
})
export class ElectionsModule {}
