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
import { RedisIoAdapter } from './common/adapters/redis-io.adapter';
import { PrismaService } from './database/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonConfig),
    bufferLogs: true,
  });

  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  const winstonLogger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(winstonLogger);

  // ── Security ──────────────────────────────────────────────────────────────
  app.use(helmet());
  app.use(cookieParser());

  const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS
    ? process.env.CORS_ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : ['http://localhost:3001', 'http://localhost:3000'];
  
  app.enableCors({ 
    origin: allowedOrigins, 
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization', 'X-Requested-With'],
    preflightContinue: false,
    optionsSuccessStatus: 200,
  });

  // ── Global pipes ──────────────────────────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── Global filter & interceptor ───────────────────────────────────────────
  app.useGlobalFilters(new GlobalExceptionFilter(winstonLogger));
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

  // ── Graceful shutdown ─────────────────────────────────────────────────────
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  // Enable shutdown hooks
  app.enableShutdownHooks();

  // Handle shutdown signals
  const signals = ['SIGTERM', 'SIGINT'];
  signals.forEach((signal) => {
    process.on(signal, async () => {
      winstonLogger.log(`Received ${signal}, starting graceful shutdown...`);
      
      // Give time for in-flight requests to complete
      setTimeout(async () => {
        await app.close();
        winstonLogger.log('Application closed gracefully');
        process.exit(0);
      }, 15000); // 15 seconds drain period
    });
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  
  winstonLogger.log(`Application is running on: http://localhost:${port}`);
  winstonLogger.log(`Swagger documentation: http://localhost:${port}/api/docs`);
  winstonLogger.log(`Health check: http://localhost:${port}/api/v1/health`);
}

bootstrap().catch(console.error);
