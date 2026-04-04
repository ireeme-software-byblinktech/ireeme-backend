import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
  Optional,
  LoggerService,
} from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    @Optional()
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();

    const { method, url } = req;
    const requestId: string = (req as any).requestId ?? 'N/A';
    const startMs = Date.now();

    this.logger?.log(
      `→ [${requestId}] ${method} ${url}`,
      LoggingInterceptor.name,
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const ms = Date.now() - startMs;
          const status = res.statusCode;
          this.logger?.log(
            `← [${requestId}] ${method} ${url} ${status} ${ms}ms`,
            LoggingInterceptor.name,
          );
        },
        error: () => {
          // Errors are logged in the GlobalExceptionFilter — avoid double-logging
          const ms = Date.now() - startMs;
          this.logger?.log(
            `← [${requestId}] ${method} ${url} ERR ${ms}ms`,
            LoggingInterceptor.name,
          );
        },
      }),
    );
  }
}
