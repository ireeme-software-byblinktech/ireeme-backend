import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a UUIDv4 per request and attaches it to:
 *   - req.requestId   (for downstream services, filters, interceptors)
 *   - X-Request-ID response header (for client-side correlation)
 */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const requestId = (req.headers['x-request-id'] as string) ?? uuidv4();
    (req as any).requestId = requestId;
    res.setHeader('X-Request-ID', requestId);
    next();
  }
}
