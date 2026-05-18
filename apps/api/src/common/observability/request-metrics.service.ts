import { Injectable } from '@nestjs/common';

interface RequestMetricInput {
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
}

@Injectable()
export class RequestMetricsService {
  private totalRequests = 0;
  private totalDurationMs = 0;
  private byStatusClass: Record<string, number> = {};
  private byRoute: Record<string, number> = {};
  private lastRequestAt: string | null = null;

  recordRequest(input: RequestMetricInput) {
    this.totalRequests += 1;
    this.totalDurationMs += input.durationMs;
    this.lastRequestAt = new Date().toISOString();

    const statusClass = `${Math.floor(input.statusCode / 100)}xx`;
    this.byStatusClass[statusClass] = (this.byStatusClass[statusClass] ?? 0) + 1;

    const routeKey = `${input.method.toUpperCase()} ${input.path}`;
    this.byRoute[routeKey] = (this.byRoute[routeKey] ?? 0) + 1;
  }

  getSnapshot() {
    const averageDurationMs =
      this.totalRequests === 0
        ? 0
        : Number((this.totalDurationMs / this.totalRequests).toFixed(2));

    return {
      totalRequests: this.totalRequests,
      averageDurationMs,
      byStatusClass: this.byStatusClass,
      byRoute: this.byRoute,
      lastRequestAt: this.lastRequestAt,
    };
  }
}
