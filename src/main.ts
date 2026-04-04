import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { WinstonModule, WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { winstonConfig } from './config/winston.config';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { LoggingInterceptor } from './common/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
    // Suppress NestJS bootstrap logs — Winston handles them
    bufferLogs: true,
  });

  // Use the Winston logger instance from the DI container so filters/interceptors
  // receive the same logger rather than a standalone instance.
  const winstonLogger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(winstonLogger);

  // ── Security ──────────────────────────────────────────────────────────────
  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({ origin: process.env.CORS_ORIGIN || '*', credentials: true });

  // ── Global pipes ──────────────────────────────────────────────────────────
  // IR-92: Validation with implicit type conversion
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── Global filter & interceptor ───────────────────────────────────────────
  // IR-89: exception filter (receives Winston logger via DI)
  app.useGlobalFilters(new GlobalExceptionFilter(winstonLogger));
  // IR-91: request/response logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor(winstonLogger));

  // ── API prefix ────────────────────────────────────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ── Swagger ───────────────────────────────────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('Blink Campus API')
    .setDescription('School management platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
