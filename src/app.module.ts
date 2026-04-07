import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { WinstonModule } from 'nest-winston';
import { ConfigModule } from './config/config.module';
import { ConfigService } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './config/redis.module';
import { winstonConfig } from './config/winston.config';
import { TenantMiddleware } from './common/middleware/tenant.middleware';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';

// Infrastructure
import { QueuesModule } from './queues/queues.module';
import { UploadsModule } from './modules/uploads/uploads.module';

// Feature modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SchoolsModule } from './modules/schools/schools.module';
import { StudentsModule } from './modules/students/students.module';
import { TeachersModule } from './modules/teachers/teachers.module';
import { ClassesModule } from './modules/classes/classes.module';
import { SubjectsModule } from './modules/subjects/subjects.module';
import { AcademicTermsModule } from './modules/academic-terms/academic-terms.module';
import { SubmissionsModule } from './modules/submissions/submissions.module';
import { TimetableModule } from './modules/timetable/timetable.module';
import { AssignmentsModule } from './modules/assignments/assignments.module';
import { GradesModule } from './modules/grades/grades.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { NotificationsListener } from './modules/notifications/notifications.listener';
import { DisciplineModule } from './modules/discipline/discipline.module';
import { HealthModule } from './modules/health/health.module';
import { LibraryModule } from './modules/library/library.module';
import { ReportsModule } from './modules/reports/reports.module';
import { HealthCheckModule } from './modules/health-check/health-check.module';

@Module({
  imports: [
    ConfigModule,
    WinstonModule.forRoot(winstonConfig),
    DatabaseModule,
    RedisModule,
    EventEmitterModule.forRoot(),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('RATE_LIMIT_TTL', 60) * 1000,
          limit: config.get<number>('RATE_LIMIT_MAX', 300),
        },
      ],
    }),
    QueuesModule,
    UploadsModule,
    AuthModule,
    UsersModule,
    SchoolsModule,
    StudentsModule,
    TeachersModule,
    ClassesModule,
    SubjectsModule,
    AcademicTermsModule,
    SubmissionsModule,
    TimetableModule,
    AssignmentsModule,
    GradesModule,
    AttendanceModule,
    NotificationsModule,
    DisciplineModule,
    HealthModule,
    LibraryModule,
    ReportsModule,
    HealthCheckModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }, NotificationsListener],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware, TenantMiddleware).forRoutes('*');
  }
}
