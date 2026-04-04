import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
        PORT: Joi.number().default(3000),
        APP_NAME: Joi.string().default('BlinkCampusAPI'),
        API_VERSION: Joi.string().default('v1'),

        // Database
        DATABASE_URL: Joi.string().required(),

        // Redis
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().default(6379),
        REDIS_PASSWORD: Joi.string().allow('').optional(),

        // JWT — separate secrets for access and refresh
        JWT_ACCESS_SECRET: Joi.string().min(32).required(),
        JWT_REFRESH_SECRET: Joi.string().min(32).required(),
        JWT_ACCESS_EXPIRY: Joi.string().default('15m'),
        JWT_REFRESH_EXPIRY: Joi.string().default('7d'),

        // AWS / MinIO
        AWS_REGION: Joi.string().default('us-east-1'),
        AWS_ACCESS_KEY_ID: Joi.string().required(),
        AWS_SECRET_ACCESS_KEY: Joi.string().required(),
        AWS_S3_BUCKET_NAME: Joi.string().required(),
        AWS_S3_BUCKET_REGION: Joi.string().default('us-east-1'),
        AWS_ENDPOINT: Joi.string().uri().optional(), // only set in dev for MinIO

        // Security
        BCRYPT_ROUNDS: Joi.number().default(12),
        RATE_LIMIT_TTL: Joi.number().default(60),
        RATE_LIMIT_MAX: Joi.number().default(300),

        // SMTP
        SMTP_HOST: Joi.string().default('localhost'),
        SMTP_PORT: Joi.number().default(1025),
        SMTP_USER: Joi.string().allow('').optional(),
        SMTP_PASS: Joi.string().allow('').optional(),
        SMTP_FROM: Joi.string().default('noreply@blinkcampus.com'),

        // Seed admin
        SUPER_ADMIN_EMAIL: Joi.string().email().required(),
        SUPER_ADMIN_PASSWORD: Joi.string().min(8).required(),
      }),
    }),
  ],
})
export class ConfigModule {}
