import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DashboardListener } from './dashboard.listener';
import { StudentsModule } from '../students/students.module';
import { GradesModule } from '../grades/grades.module';
import { AssignmentsModule } from '../assignments/assignments.module';
import { AttendanceModule } from '../attendance/attendance.module';
import { TimetableModule } from '../timetable/timetable.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { StudentsRepository } from '../students/students.repository';
import { GradesRepository } from '../grades/grades.repository';
import { AssignmentsRepository } from '../assignments/assignments.repository';
import { AttendanceRepository } from '../attendance/attendance.repository';
import { TimetableRepository } from '../timetable/timetable.repository';

@Module({
  imports: [
    StudentsModule, 
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
    GradesRepository,
    AssignmentsRepository,
    AttendanceRepository,
    TimetableRepository,
  ],
})
export class DashboardModule {}
