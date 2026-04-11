import { Injectable, Logger } from '@nestjs/common';
import { CacheService } from './cache.service';

export interface MetricData {
  timestamp: number;
  value: number;
  tags?: Record<string, string>;
}

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);
  private readonly metrics = new Map<string, MetricData[]>();
  private readonly MAX_METRICS_PER_KEY = 1000;

  constructor(private readonly cacheService: CacheService) {}

  /**
   * Record a metric value
   */
  async record(name: string, value: number, tags?: Record<string, string>): Promise<void> {
    const metric: MetricData = {
      timestamp: Date.now(),
      value,
      tags,
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metrics = this.metrics.get(name)!;
    metrics.push(metric);

    // Keep only recent metrics
    if (metrics.length > this.MAX_METRICS_PER_KEY) {
      metrics.shift();
    }

    // Store in Redis for distributed metrics
    const key = `metrics:${name}:${Date.now()}`;
    await this.cacheService.set(key, metric, { ttl: 3600 }); // 1 hour
  }

  /**
   * Increment a counter
   */
  async increment(name: string, value: number = 1, tags?: Record<string, string>): Promise<void> {
    await this.record(name, value, tags);
  }

  /**
   * Record timing/duration
   */
  async timing(name: string, duration: number, tags?: Record<string, string>): Promise<void> {
    await this.record(`${name}.duration`, duration, tags);
  }

  /**
   * Get metrics summary
   */
  getSummary(name: string): {
    count: number;
    avg: number;
    min: number;
    max: number;
    sum: number;
  } | null {
    const metrics = this.metrics.get(name);
    if (!metrics || metrics.length === 0) {
      return null;
    }

    const values = metrics.map(m => m.value);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    return {
      count: values.length,
      avg,
      min,
      max,
      sum,
    };
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const [name, metrics] of this.metrics.entries()) {
      result[name] = this.getSummary(name);
    }

    return result;
  }

  /**
   * Clear metrics
   */
  clear(name?: string): void {
    if (name) {
      this.metrics.delete(name);
    } else {
      this.metrics.clear();
    }
  }

  /**
   * Record HTTP request metrics
   */
  async recordHttpRequest(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
  ): Promise<void> {
    await Promise.all([
      this.increment('http.requests.total', 1, { method, path, status: statusCode.toString() }),
      this.timing('http.requests.duration', duration, { method, path }),
    ]);
  }

  /**
   * Record database query metrics
   */
  async recordDatabaseQuery(operation: string, duration: number): Promise<void> {
    await Promise.all([
      this.increment('db.queries.total', 1, { operation }),
      this.timing('db.queries.duration', duration, { operation }),
    ]);
  }

  /**
   * Record cache metrics
   */
  async recordCacheOperation(operation: 'hit' | 'miss' | 'set' | 'del'): Promise<void> {
    await this.increment(`cache.${operation}`, 1);
  }

  /**
   * Record WebSocket metrics
   */
  async recordWebSocketConnection(action: 'connect' | 'disconnect'): Promise<void> {
    await this.increment(`websocket.${action}`, 1);
  }
}
