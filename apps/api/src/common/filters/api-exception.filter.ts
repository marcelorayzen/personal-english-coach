import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

interface HttpRequestLike {
  method: string;
  url: string;
}

interface HttpResponseLike {
  status(code: number): this;
  json(body: unknown): this;
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<HttpResponseLike>();
    const request = context.getRequest<HttpRequestLike>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse = isHttpException ? exception.getResponse() : null;

    const normalizedError = this.normalizeError(status, exceptionResponse);
    const payload: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      method: request.method,
      path: request.url,
      error: normalizedError,
    };

    if (!isHttpException) {
      this.logger.error(exception);
    }

    response.status(status).json(payload);
  }

  private normalizeError(status: number, exceptionResponse: unknown) {
    const defaultCode = this.mapStatusToCode(status);

    if (typeof exceptionResponse === 'string') {
      return {
        status,
        code: defaultCode,
        message: exceptionResponse,
      };
    }

    if (
      exceptionResponse &&
      typeof exceptionResponse === 'object' &&
      !Array.isArray(exceptionResponse)
    ) {
      const exceptionData = exceptionResponse as {
        message?: string | string[];
        error?: string;
      };

      const message = Array.isArray(exceptionData.message)
        ? 'Falha de validacao da requisicao'
        : exceptionData.message ?? this.defaultMessageForStatus(status);
      const code = this.sanitizeCode(exceptionData.error) ?? defaultCode;

      const normalized: Record<string, unknown> = {
        status,
        code,
        message,
      };

      if (Array.isArray(exceptionData.message)) {
        normalized.details = exceptionData.message;
      }

      return normalized;
    }

    return {
      status,
      code: defaultCode,
      message: this.defaultMessageForStatus(status),
    };
  }

  private sanitizeCode(rawCode?: string): string | null {
    if (!rawCode) {
      return null;
    }
    return rawCode.replace(/\s+/g, '_').toUpperCase();
  }

  private mapStatusToCode(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_REQUEST';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'UNPROCESSABLE_ENTITY';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'TOO_MANY_REQUESTS';
      default:
        if (status >= 500) {
          return 'INTERNAL_SERVER_ERROR';
        }
        return 'HTTP_ERROR';
    }
  }

  private defaultMessageForStatus(status: number): string {
    if (status >= 500) {
      return 'Erro interno do servidor';
    }
    return 'Falha na requisicao';
  }
}
