import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';

export interface CircuitBreakerOptions {
  failureThreshold: number; // Number of failures before opening
  successThreshold: number; // Number of successes to close
  timeout: number; // Time in ms before attempting to close
}

enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private nextAttempt: number = Date.now();
  private readonly logger = new Logger(`CircuitBreaker`);

  constructor(
    private readonly name: string,
    private readonly options: CircuitBreakerOptions,
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttempt) {
        throw new ServiceUnavailableException(
          `Circuit breaker is OPEN for ${this.name}`,
        );
      }
      this.state = CircuitState.HALF_OPEN;
      this.logger.warn(`Circuit breaker ${this.name} entering HALF_OPEN state`);
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failureCount = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.options.successThreshold) {
        this.state = CircuitState.CLOSED;
        this.successCount = 0;
        this.logger.log(`Circuit breaker ${this.name} is now CLOSED`);
      }
    }
  }

  private onFailure() {
    this.failureCount++;
    this.successCount = 0;

    if (this.failureCount >= this.options.failureThreshold) {
      this.state = CircuitState.OPEN;
      this.nextAttempt = Date.now() + this.options.timeout;
      this.logger.error(
        `Circuit breaker ${this.name} is now OPEN. Will retry after ${this.options.timeout}ms`,
      );
    }
  }

  getState(): CircuitState {
    return this.state;
  }
}

@Injectable()
export class CircuitBreakerService {
  private readonly breakers = new Map<string, CircuitBreaker>();
  private readonly logger = new Logger(CircuitBreakerService.name);

  /**
   * Execute function with circuit breaker protection
   */
  async execute<T>(
    name: string,
    fn: () => Promise<T>,
    options?: Partial<CircuitBreakerOptions>,
  ): Promise<T> {
    const breaker = this.getOrCreate(name, options);
    return breaker.execute(fn);
  }

  /**
   * Get circuit breaker state
   */
  getState(name: string): string {
    const breaker = this.breakers.get(name);
    return breaker ? breaker.getState() : 'NOT_FOUND';
  }

  private getOrCreate(
    name: string,
    options?: Partial<CircuitBreakerOptions>,
  ): CircuitBreaker {
    if (!this.breakers.has(name)) {
      const defaultOptions: CircuitBreakerOptions = {
        failureThreshold: 5,
        successThreshold: 2,
        timeout: 60000, // 1 minute
      };
      this.breakers.set(
        name,
        new CircuitBreaker(name, { ...defaultOptions, ...options }),
      );
    }
    return this.breakers.get(name)!;
  }
}
