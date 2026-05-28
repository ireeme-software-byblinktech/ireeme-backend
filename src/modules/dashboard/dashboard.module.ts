import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DashboardListener } from './dashboard.listener';
import { StudentsModule } from '../students/students.module';
import { TeachersModule } from '../teachers/teachers.module';
import { SubjectsModule } from '../subjects/subjects.module';
import { GradesModule } from '../grades/grades.module';
import { AssignmentsModule } from '../assignments/assignments.module';
import { AttendanceModule } from '../attendance/attendance.module';
import { TimetableModule } from '../timetable/timetable.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { StudentsRepository } from '../students/students.repository';
import { TeachersRepository } from '../teachers/teachers.repository';
import { SubjectsRepository } from '../subjects/subjects.repository';
import { GradesRepository } from '../grades/grades.repository';
import { AssignmentsRepository } from '../assignments/assignments.repository';
import { AttendanceRepository } from '../attendance/attendance.repository';
import { TimetableRepository } from '../timetable/timetable.repository';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    StudentsModule,
    TeachersModule,
    SubjectsModule,
    GradesModule,
    AssignmentsModule,
    AttendanceModule,
    TimetableModule,
    NotificationsModule
  ],
  controllers: [DashboardController],
  providers: [
    DashboardService,
    DashboardListener,
    StudentsRepository,
    TeachersRepository,
    SubjectsRepository,
    GradesRepository,
    AssignmentsRepository,
    AttendanceRepository,
    TimetableRepository,
  ],
})
export class DashboardModule { }
