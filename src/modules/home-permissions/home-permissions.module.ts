import { Module } from '@nestjs/common';
import { HomePermissionsController } from './home-permissions.controller';
import { HomePermissionsService } from './home-permissions.service';
import { HomePermissionsRepository } from './home-permissions.repository';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [HomePermissionsController],
  providers: [HomePermissionsService, HomePermissionsRepository],
  exports: [HomePermissionsService],
})
export class HomePermissionsModule {}
