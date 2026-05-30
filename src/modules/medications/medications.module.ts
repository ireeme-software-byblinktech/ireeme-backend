import { Module } from '@nestjs/common';
import { MedicationsController } from './medications.controller';
import { MedicationsService } from './medications.service';
import { MedicationsRepository } from './medications.repository';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [MedicationsController],
  providers: [MedicationsService, MedicationsRepository],
  exports: [MedicationsService],
})
export class MedicationsModule {}
