import { Module } from '@nestjs/common';
import { TeachersController } from './teachers.controller';
import { TeachersService } from './teachers.service';
import { TeachersRepository } from './teachers.repository';
import { TimetableUploadService } from './timetable-upload.service';
import { TimetableUploadRepository } from './timetable-upload.repository';
import { UsersModule } from '../users/users.module';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [UsersModule, UploadsModule],
  controllers: [TeachersController],
  providers: [TeachersService, TeachersRepository, TimetableUploadService, TimetableUploadRepository],
  exports: [TeachersService, TeachersRepository, TimetableUploadService, TimetableUploadRepository],
})
export class TeachersModule {}
