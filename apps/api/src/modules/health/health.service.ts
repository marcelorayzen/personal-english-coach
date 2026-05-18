import { Injectable } from '@nestjs/common';
import { Client } from 'pg';
import { RequestMetricsService } from '../../common/observability/request-metrics.service';

@Injectable()
export class HealthService {
  constructor(private readonly requestMetricsService: RequestMetricsService) {}

  private readonly databaseUrl = process.env.DATABASE_URL;

  async getStatus() {
    const startedAt = Date.now();
    let dbReady = false;
    let client: Client | null = null;

    try {
      if (!this.databaseUrl) {
        throw new Error('DATABASE_URL is not set');
      }

      client = new Client({ connectionString: this.databaseUrl });
      await client.connect();
      await client.query('SELECT 1');
      dbReady = true;
    } catch {
      dbReady = false;
    } finally {
      await client?.end();
    }

    return {
      module: 'health',
      status: dbReady ? 'ready' : 'not_ready',
      readiness: {
        app: 'ok',
        db: dbReady ? 'ok' : 'error',
      },
      metrics: this.requestMetricsService.getSnapshot(),
      checkedAt: new Date().toISOString(),
      latencyMs: Date.now() - startedAt,
    };
  }
}
