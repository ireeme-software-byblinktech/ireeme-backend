import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../../config/redis.module';

export const RATE_LIMIT_KEY = 'rate_limit';

export interface RateLimitOptions {
  points: number; // Number of requests
  duration: number; // Time window in seconds
  keyPrefix?: string;
  blockDuration?: number; // Block duration in seconds after limit exceeded
}

export const RateLimit = (options: RateLimitOptions) => {
  return (target: any, key?: string, descriptor?: PropertyDescriptor) => {
    if (descriptor) {
      Reflect.defineMetadata(RATE_LIMIT_KEY, options, descriptor.value);
      return descriptor;
    }
    Reflect.defineMetadata(RATE_LIMIT_KEY, options, target);
    return target;
  };
};

@Injectable()
export class AdvancedRateLimitGuard implements CanActivate {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = this.reflector.get<RateLimitOptions>(
      RATE_LIMIT_KEY,
      context.getHandler(),
    ) || this.reflector.get<RateLimitOptions>(
      RATE_LIMIT_KEY,
      context.getClass(),
    );

    if (!options) {
      return true; // No rate limit configured
    }

    const request = context.switchToHttp().getRequest();
    const identifier = this.getIdentifier(request, options);
    const key = `rate_limit:${options.keyPrefix || 'default'}:${identifier}`;

    const current = await this.redis.incr(key);
    
    if (current === 1) {
      await this.redis.expire(key, options.duration);
    }

    if (current > options.points) {
      // Block user if blockDuration is specified
      if (options.blockDuration) {
        const blockKey = `rate_limit:blocked:${identifier}`;
        await this.redis.setex(blockKey, options.blockDuration, '1');
      }

      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Rate limit exceeded',
          retryAfter: options.duration,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Add rate limit headers
    const response = context.switchToHttp().getResponse();
    response.setHeader('X-RateLimit-Limit', options.points);
    response.setHeader('X-RateLimit-Remaining', Math.max(0, options.points - current));
    response.setHeader('X-RateLimit-Reset', Date.now() + options.duration * 1000);

    return true;
  }

  private getIdentifier(request: any, options: RateLimitOptions): string {
    // Use user ID if authenticated, otherwise use IP
    const userId = request.user?.sub;
    const ip = request.ip || request.connection.remoteAddress;
    return userId || ip;
  }
}
