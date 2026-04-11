import { Module, Global } from '@nestjs/common';
import { CacheService } from './services/cache.service';
import { CircuitBreakerService } from './services/circuit-breaker.service';
import { MetricsService } from './services/metrics.service';
import { CacheInterceptor } from './interceptors/cache.interceptor';
import { AdvancedRateLimitGuard } from './guards/advanced-rate-limit.guard';

@Global()
@Module({
  providers: [
    CacheService,
    CircuitBreakerService,
    MetricsService,
    CacheInterceptor,
    AdvancedRateLimitGuard,
  ],
  exports: [
    CacheService,
    CircuitBreakerService,
    MetricsService,
    CacheInterceptor,
    AdvancedRateLimitGuard,
  ],
})
export class CommonModule {}
