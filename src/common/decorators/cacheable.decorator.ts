import { SetMetadata } from '@nestjs/common';

export const CACHE_KEY_METADATA = 'cache:key';
export const CACHE_TTL_METADATA = 'cache:ttl';

export interface CacheableOptions {
  /**
   * Cache key template. Use {param} for dynamic values
   * Example: 'user:{userId}:profile'
   */
  key: string;
  
  /**
   * Time to live in seconds
   */
  ttl?: number;
}

/**
 * Decorator to cache method results
 * @param options Cache configuration
 */
export const Cacheable = (options: CacheableOptions) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata(CACHE_KEY_METADATA, options.key)(target, propertyKey, descriptor);
    SetMetadata(CACHE_TTL_METADATA, options.ttl || 300)(target, propertyKey, descriptor);
    return descriptor;
  };
};

/**
 * Decorator to invalidate cache after method execution
 * @param patterns Cache key patterns to invalidate
 */
export const CacheEvict = (...patterns: string[]) => {
  return SetMetadata('cache:evict', patterns);
};
