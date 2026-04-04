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
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { SchoolsModule } from './modules/schools/schools.module';
import { StudentsModule } from './modules/students/students.module';
import { TenantMiddleware } from './common/middleware/tenant.middleware';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';

@Module({
  imports: [
    ConfigModule,
    WinstonModule.forRoot(winstonConfig),
    DatabaseModule,
    RedisModule,
    EventEmitterModule.forRoot(),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ([{
        ttl: config.get<number>('RATE_LIMIT_TTL', 60) * 1000,
        limit: config.get<number>('RATE_LIMIT_MAX', 300),
      }]),
    }),
    AuthModule,
    UsersModule,
    SchoolsModule,
    StudentsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware, TenantMiddleware).forRoutes('*');
  }
}
