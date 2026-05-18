import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

interface HttpRequestLike {
  headers?: Record<string, string | string[] | undefined>;
  correlationId?: string;
}

interface HttpResponseLike {
  setHeader(name: string, value: string): void;
}

type NextFunctionLike = () => void;

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: HttpRequestLike, res: HttpResponseLike, next: NextFunctionLike) {
    const incomingHeader = req.headers?.['x-correlation-id'];
    const correlationId =
      this.extractHeaderValue(incomingHeader) ?? randomUUID();

    req.correlationId = correlationId;
    res.setHeader('x-correlation-id', correlationId);
    next();
  }

  private extractHeaderValue(value?: string | string[]): string | null {
    if (!value) {
      return null;
    }
    return Array.isArray(value) ? value[0] ?? null : value;
  }
}
