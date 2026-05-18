import 'reflect-metadata';
import { describe, before, after, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { CoachController } from '../src/modules/coach/coach.controller';
import { CoachService } from '../src/modules/coach/coach.service';
import { LearnerMemoryController } from '../src/modules/learner-memory/learner-memory.controller';
import { LearnerMemoryService } from '../src/modules/learner-memory/learner-memory.service';
import { ReviewController } from '../src/modules/review/review.controller';
import { ReviewService } from '../src/modules/review/review.service';
import { ConfigController } from '../src/modules/config/config.controller';
import { ConfigService } from '../src/modules/config/config.service';
import { HealthController } from '../src/modules/health/health.controller';
import { HealthService } from '../src/modules/health/health.service';
import { ApiExceptionFilter } from '../src/common/filters/api-exception.filter';
import { RequestLoggingInterceptor } from '../src/common/observability/request-logging.interceptor';
import { RequestMetricsService } from '../src/common/observability/request-metrics.service';

describe('Wave 1 API contract', () => {
  let app: INestApplication;

  before(async () => {
    const coachServiceMock: Pick<
      CoachService,
      'createSession' | 'createTurn' | 'getSession' | 'getStatus'
    > = {
      getStatus: () => ({ module: 'coach', status: 'ready', phase: 'phase-1' }),
      createSession: async () => ({
        sessionId: 'sess_123',
        learnerProfileId: 'learner_123',
        sessionType: 'conversation',
        title: 'Session title',
        startedAt: '2026-04-16T00:00:00.000Z',
      }),
      createTurn: async (_sessionId, body) => {
        if (!body?.learnerText?.trim()) {
          throw new BadRequestException('learnerText e obrigatorio');
        }
        return {
          sessionId: 'sess_123',
          learnerUtterance: {
            id: 'utt_l',
            role: 'learner',
            transcript: body.learnerText,
            createdAt: '2026-04-16T00:00:00.000Z',
          },
          coachUtterance: {
            id: 'utt_c',
            role: 'coach',
            transcript: 'Bom esforço. Ajuste principal deste turno.',
            createdAt: '2026-04-16T00:00:01.000Z',
          },
          systemUtterance: {
            id: 'utt_s',
            role: 'system',
            transcript: 'Applied 1 correction focus point(s).',
            createdAt: '2026-04-16T00:00:01.000Z',
          },
          corrections: [
            {
              issue: "Use 'have' with 'I'.",
              guidance: "Say 'I have ...' instead of 'I has ...'.",
            },
          ],
          synthesis: {
            provider: 'mock-synthesis',
            format: 'text/plain',
            audioUrl: null,
          },
        };
      },
      getSession: async (sessionId) => ({
        sessionId,
        learnerProfileId: 'learner_123',
        sessionType: 'conversation',
        title: 'Session title',
        startedAt: '2026-04-16T00:00:00.000Z',
        endedAt: null,
        utterances: [],
      }),
    };

    const learnerMemoryServiceMock: Pick<
      LearnerMemoryService,
      'getStatus' | 'getProfile' | 'getState' | 'getSnapshots'
    > = {
      getStatus: () => ({
        module: 'learner-memory',
        status: 'ready',
        phase: 'phase-2',
      }),
      getProfile: async () => ({
        learnerProfileId: 'learner_123',
        displayName: 'Default Learner',
        levelEstimate: 'A2',
      }),
      getState: async () => ({
        learnerProfileId: 'learner_123',
        summary: {
          sessionCount: 1,
          utteranceCount: 3,
          mistakeCount: 1,
          trackedSkillCount: 1,
          averageSkillScore: 0.75,
        },
        topWeaknesses: [{ category: 'grammar', count: 1 }],
      }),
      getSnapshots: async () => ({
        learnerProfileId: 'learner_123',
        total: 1,
        items: [
          {
            id: 'snap_1',
            summary: 'Sessions: 1; Utterances: 3; Weaknesses: grammar (1)',
            createdAt: '2026-04-16T00:00:02.000Z',
          },
        ],
      }),
    };

    const reviewServiceMock: Pick<
      ReviewService,
      'getStatus' | 'getQueue' | 'completeQueueItem'
    > = {
      getStatus: () => ({ module: 'review', status: 'ready', phase: 'phase-3' }),
      getQueue: async () => ({
        learnerProfileId: 'learner_123',
        total: 1,
        items: [
          {
            id: 'review_1',
            itemType: 'mistake:grammar',
            prompt: 'Do 5 short sentences focused on correct tense and agreement.',
            priority: 80,
            isCompleted: false,
            createdAt: '2026-04-16T00:00:03.000Z',
          },
        ],
      }),
      completeQueueItem: async (itemId) => ({
        itemId,
        isCompleted: true,
      }),
    };

    const configServiceMock: Pick<
      ConfigService,
      'getStatus' | 'getPreferences' | 'updatePreferences'
    > = {
      getStatus: () => ({ module: 'config', status: 'ready', phase: 'phase-2' }),
      getPreferences: async () => ({
        learnerProfileId: 'learner_123',
        ptBrSupportLevel: 'medium',
        correctionIntensity: 'balanced',
      }),
      updatePreferences: async (body) => ({
        learnerProfileId: 'learner_123',
        ptBrSupportLevel: body.ptBrSupportLevel ?? 'medium',
        correctionIntensity: body.correctionIntensity ?? 'balanced',
        learningGoal: body.learningGoal ?? null,
        currentFocus: body.currentFocus ?? null,
      }),
    };

    const healthServiceMock: Pick<HealthService, 'getStatus'> = {
      getStatus: async () => ({
        module: 'health',
        status: 'ready',
        readiness: { app: 'ok', db: 'ok' },
      }),
    };
    const requestMetricsService = new RequestMetricsService();

    const moduleRef = await Test.createTestingModule({
      controllers: [
        CoachController,
        LearnerMemoryController,
        ReviewController,
        ConfigController,
        HealthController,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new ApiExceptionFilter());
    app.useGlobalInterceptors(
      new RequestLoggingInterceptor(requestMetricsService),
    );

    // In tsx test runtime, Nest decorator metadata injection is not emitted.
    // Bind service mocks manually to keep endpoint-contract tests isolated.
    (moduleRef.get(CoachController) as unknown as { service: unknown }).service =
      coachServiceMock;
    (
      moduleRef.get(LearnerMemoryController) as unknown as { service: unknown }
    ).service = learnerMemoryServiceMock;
    (moduleRef.get(ReviewController) as unknown as { service: unknown }).service =
      reviewServiceMock;
    (moduleRef.get(ConfigController) as unknown as { service: unknown }).service =
      configServiceMock;
    (moduleRef.get(HealthController) as unknown as { service: unknown }).service =
      healthServiceMock;

    await app.init();
  });

  after(async () => {
    await app.close();
  });

  it('POST /api/coach/sessions', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/coach/sessions')
      .send({ title: 'Session title' })
      .expect(201);

    assert.equal(response.body.sessionId, 'sess_123');
  });

  it('POST /api/coach/sessions/:sessionId/turns', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/coach/sessions/sess_123/turns')
      .send({ learnerText: 'I has a book' })
      .expect(201);

    assert.equal(response.body.sessionId, 'sess_123');
    assert.equal(response.body.corrections.length, 1);
  });

  it('POST /api/coach/sessions/:sessionId/turns returns 400 on invalid payload', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/coach/sessions/sess_123/turns')
      .send({ learnerText: '   ' })
      .expect(400);

    assert.equal(response.body.error.status, 400);
    assert.equal(response.body.error.code, 'BAD_REQUEST');
    assert.equal(response.body.error.message, 'learnerText e obrigatorio');
    assert.equal(response.body.path, '/api/coach/sessions/sess_123/turns');
  });

  it('GET /api/coach/sessions/:sessionId', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/coach/sessions/sess_123')
      .expect(200);

    assert.equal(response.body.sessionId, 'sess_123');
  });

  it('GET /api/learner/profile', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/learner/profile')
      .expect(200);

    assert.equal(response.body.learnerProfileId, 'learner_123');
  });

  it('GET /api/learner/state', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/learner/state')
      .expect(200);

    assert.equal(response.body.summary.sessionCount, 1);
  });

  it('GET /api/learner/snapshots', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/learner/snapshots')
      .expect(200);

    assert.equal(response.body.total, 1);
  });

  it('GET /api/review/queue', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/review/queue')
      .expect(200);

    assert.equal(response.body.items[0].itemType, 'mistake:grammar');
  });

  it('POST /api/review/queue/:itemId/complete', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/review/queue/review_1/complete')
      .expect(201);

    assert.equal(response.body.itemId, 'review_1');
    assert.equal(response.body.isCompleted, true);
  });

  it('GET /api/config/preferences', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/config/preferences')
      .expect(200);

    assert.equal(response.body.ptBrSupportLevel, 'medium');
  });

  it('PUT /api/config/preferences', async () => {
    const response = await request(app.getHttpServer())
      .put('/api/config/preferences')
      .send({
        ptBrSupportLevel: 'low',
        correctionIntensity: 'light',
        currentFocus: 'past simple',
      })
      .expect(200);

    assert.equal(response.body.ptBrSupportLevel, 'low');
    assert.equal(response.body.correctionIntensity, 'light');
  });

  it('GET /api/health/status', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/health/status')
      .expect(200);

    assert.equal(response.body.status, 'ready');
    assert.equal(response.body.readiness.db, 'ok');
  });
});
