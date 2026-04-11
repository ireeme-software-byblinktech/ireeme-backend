import { Injectable, Inject, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from '../../config/redis.module';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly defaultTTL = 300; // 5 minutes

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  /**
   * Get cached value
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set cache value
   */
  async set(key: string, value: any, options?: CacheOptions): Promise<void> {
    try {
      const ttl = options?.ttl ?? this.defaultTTL;
      const fullKey = options?.prefix ? `${options.prefix}:${key}` : key;
      await this.redis.setex(fullKey, ttl, JSON.stringify(value));
    } catch (error) {
      this.logger.error(`Cache set error for key ${key}:`, error);
    }
  }

  /**
   * Delete cache key
   */
  async del(key: string | string[]): Promise<void> {
    try {
      if (Array.isArray(key)) {
        await this.redis.del(...key);
      } else {
        await this.redis.del(key);
      }
    } catch (error) {
      this.logger.error(`Cache delete error:`, error);
    }
  }

  /**
   * Delete all keys matching pattern
   */
  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      this.logger.error(`Cache delete pattern error:`, error);
    }
  }

  /**
   * Get or set cache (cache-aside pattern)
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options?: CacheOptions,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, options);
    return value;
  }

  /**
   * Increment counter
   */
  async increment(key: string, ttl?: number): Promise<number> {
    try {
      const value = await this.redis.incr(key);
      if (ttl && value === 1) {
        await this.redis.expire(key, ttl);
      }
      return value;
    } catch (error) {
      this.logger.error(`Cache increment error:`, error);
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Cache exists error:`, error);
      return false;
    }
  }

  /**
   * Set with expiry (NX - only if not exists)
   */
  async setNX(key: string, value: any, ttl: number): Promise<boolean> {
    try {
      const result = await this.redis.set(key, JSON.stringify(value), 'EX', ttl, 'NX');
      return result === 'OK';
    } catch (error) {
      this.logger.error(`Cache setNX error:`, error);
      return false;
    }
  }

  /**
   * Get multiple keys at once
   */
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      const values = await this.redis.mget(...keys);
      return values.map(v => (v ? JSON.parse(v) : null));
    } catch (error) {
      this.logger.error(`Cache mget error:`, error);
      return keys.map(() => null);
    }
  }

  /**
   * Cache invalidation for school-scoped data
   */
  async invalidateSchoolCache(schoolId: string, entity?: string): Promise<void> {
    const pattern = entity 
      ? `school:${schoolId}:${entity}:*`
      : `school:${schoolId}:*`;
    await this.delPattern(pattern);
  }

  /**
   * Cache invalidation for user-scoped data
   */
  async invalidateUserCache(userId: string): Promise<void> {
    await this.delPattern(`user:${userId}:*`);
  }
}
