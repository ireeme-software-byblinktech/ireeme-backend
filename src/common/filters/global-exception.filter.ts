import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus, 
  Inject,
  Optional,
  LoggerService,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    @Optional()
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const requestId: string = (request as any).requestId ?? 'N/A';

    let status: number;
    let message: string;
    let error: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
        error = exception.message;
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, unknown>;
        // class-validator returns { message: string[] | string, error: string }
        message = Array.isArray(resObj['message'])
          ? (resObj['message'] as string[]).join(', ')
          : (resObj['message'] as string) ?? exception.message;
        error = (resObj['error'] as string) ?? HttpStatus[status] ?? 'Error';
      } else {
        message = exception.message;
        error = HttpStatus[status] ?? 'Error';
      }
    } else {
      // Unknown / unhandled error — never leak details
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
      error = 'Internal Server Error';

      // Log the real error server-side only
      if (this.logger) {
        this.logger.error(
          `[${requestId}] Unhandled exception on ${request.method} ${request.url}`,
          exception instanceof Error ? exception.stack : String(exception),
          GlobalExceptionFilter.name,
        );
      }
    }

    if (this.logger && status >= 400 && status < 500) {
      this.logger.warn(
        `[${requestId}] ${request.method} ${request.url} → ${status}: ${message}`,
        GlobalExceptionFilter.name,
      );
    }

    response.status(status).json({
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId,
    });
  }
}
