import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RequestMetricsService } from './request-metrics.service';

interface HttpRequestLike {
  method: string;
  url: string;
  headers?: Record<string, string | string[] | undefined>;
  correlationId?: string;
}

interface HttpResponseLike {
  statusCode: number;
}

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  constructor(private readonly requestMetricsService: RequestMetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<HttpRequestLike>();
    const response = httpContext.getResponse<HttpResponseLike>();
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => this.onRequestCompleted(request, response, start),
        error: () => this.onRequestCompleted(request, response, start),
      }),
    );
  }

  private onRequestCompleted(
    request: HttpRequestLike,
    response: HttpResponseLike,
    start: number,
  ) {
    const durationMs = Date.now() - start;
    const statusCode = response.statusCode ?? 500;
    const path = request.url ?? '';
    const correlationId =
      request.correlationId ??
      this.extractHeaderValue(request.headers?.['x-correlation-id']) ??
      'unknown';

    this.requestMetricsService.recordRequest({
      method: request.method ?? 'GET',
      path,
      statusCode,
      durationMs,
    });

    this.logger.log(
      JSON.stringify({
        event: 'request.completed',
        method: request.method,
        path,
        statusCode,
        durationMs,
        correlationId,
      }),
    );
  }

  private extractHeaderValue(value?: string | string[]): string | null {
    if (!value) {
      return null;
    }
    return Array.isArray(value) ? value[0] ?? null : value;
  }
}
