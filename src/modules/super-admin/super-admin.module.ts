import { Module } from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';
import { SuperAdminController } from './super-admin.controller';
import { SuperAdminRepository } from './super-admin.repository';

@Module({
  controllers: [SuperAdminController],
  providers: [SuperAdminService, SuperAdminRepository],
  exports: [SuperAdminService],
})
export class SuperAdminModule {}
