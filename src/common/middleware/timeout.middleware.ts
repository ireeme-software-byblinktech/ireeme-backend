import { Injectable, NestMiddleware, RequestTimeoutException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TimeoutMiddleware implements NestMiddleware {
  private readonly timeout: number;

  constructor(private config: ConfigService) {
    this.timeout = this.config.get<number>('REQUEST_TIMEOUT', 30000); // 30s default
  }

  use(req: Request, res: Response, next: NextFunction) {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        throw new RequestTimeoutException('Request timeout exceeded');
      }
    }, this.timeout);

    res.on('finish', () => clearTimeout(timer));
    res.on('close', () => clearTimeout(timer));

    next();
  }
}
