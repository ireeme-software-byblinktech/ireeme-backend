import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { CacheService } from '../services/cache.service';
import { CACHE_KEY_METADATA, CACHE_TTL_METADATA } from '../decorators/cacheable.decorator';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CacheInterceptor.name);

  constructor(
    private readonly cacheService: CacheService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const cacheKey = this.reflector.get<string>(CACHE_KEY_METADATA, context.getHandler());
    const cacheTTL = this.reflector.get<number>(CACHE_TTL_METADATA, context.getHandler());

    if (!cacheKey) {
      return next.handle();
    }

    // Build cache key from template and request params
    const request = context.switchToHttp().getRequest();
    const resolvedKey = this.resolveKey(cacheKey, request);

    // Try to get from cache
    const cached = await this.cacheService.get(resolvedKey);
    if (cached !== null) {
      this.logger.debug(`Cache hit: ${resolvedKey}`);
      return of(cached);
    }

    // Cache miss - execute and cache result
    this.logger.debug(`Cache miss: ${resolvedKey}`);
    return next.handle().pipe(
      tap(async (data) => {
        await this.cacheService.set(resolvedKey, data, { ttl: cacheTTL });
      }),
    );
  }

  private resolveKey(template: string, request: any): string {
    let key = template;
    
    // Replace {param} with actual values from request
    const matches = template.match(/\{([^}]+)\}/g);
    if (matches) {
      matches.forEach((match) => {
        const param = match.slice(1, -1); // Remove { }
        const value = request.params?.[param] || request.query?.[param] || request.user?.[param];
        key = key.replace(match, value || 'unknown');
      });
    }

    return key;
  }
}
