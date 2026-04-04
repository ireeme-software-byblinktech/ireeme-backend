import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';

/**
 * Extracts schoolId from the JWT and attaches it to the request.
 * This ensures every downstream service has access to the tenant context.
 */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly jwtService: JwtService) {}

  use(req: Request, _res: Response, next: NextFunction) {
    const token = this.extractToken(req);
    if (token) {
      try {
        const payload = this.jwtService.decode(token) as { schoolId?: string; sub?: string };
        if (payload?.schoolId) {
          (req as any).schoolId = payload.schoolId;
        }
      } catch {
        // Non-authenticated routes — schoolId stays undefined
      }
    }
    next();
  }

  private extractToken(req: Request): string | null {
    const auth = req.headers.authorization;
    if (auth?.startsWith('Bearer ')) return auth.slice(7);
    return null;
  }
}
