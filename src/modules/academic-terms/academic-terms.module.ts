import { Module } from '@nestjs/common';
import { AcademicTermsController } from './academic-terms.controller';
import { AcademicTermsService } from './academic-terms.service';
import { AcademicTermsRepository } from './academic-terms.repository';

@Module({
  controllers: [AcademicTermsController],
  providers: [AcademicTermsService, AcademicTermsRepository],
  exports: [AcademicTermsService],
})
export class AcademicTermsModule {}
