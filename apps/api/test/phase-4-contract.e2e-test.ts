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
import { ApiExceptionFilter } from '../src/common/filters/api-exception.filter';
import { RequestLoggingInterceptor } from '../src/common/observability/request-logging.interceptor';
import { RequestMetricsService } from '../src/common/observability/request-metrics.service';
import { ProgressController } from '../src/modules/progress/progress.controller';
import { ProgressService } from '../src/modules/progress/progress.service';
import { ReadingController } from '../src/modules/reading/reading.controller';
import { ReadingService } from '../src/modules/reading/reading.service';

describe('Phase 4 API contract', () => {
  let app: INestApplication;

  before(async () => {
    const readingServiceMock: Pick<
      ReadingService,
      'getStatus' | 'createSession' | 'createAttempt'
    > = {
      getStatus: () => ({ module: 'reading', status: 'ready', phase: 'phase-4' }),
      createSession: async (body) => ({
        sessionId: 'read_123',
        learnerProfileId: 'learner_123',
        sessionType: 'reading',
        title: body.title ?? 'Reading Practice',
        targetText: body.targetText,
        startedAt: '2026-04-18T00:00:00.000Z',
      }),
      createAttempt: async (_sessionId, body) => {
        if (!body?.attemptText?.trim()) {
          throw new BadRequestException('attemptText e obrigatorio');
        }
        return {
          sessionId: 'read_123',
          learnerUtterance: {
            id: 'utt_r_1',
            role: 'learner',
            transcript: body.attemptText,
            createdAt: '2026-04-18T00:01:00.000Z',
          },
          coachUtterance: {
            id: 'utt_r_2',
            role: 'coach',
            transcript: 'Boa tentativa com pequenas lacunas.',
            createdAt: '2026-04-18T00:01:01.000Z',
          },
          assessment: {
            accuracyPercent: 82.5,
            coveragePercent: 88.9,
            targetWordCount: 9,
            attemptWordCount: 8,
            missingWords: ['reservation'],
            extraWords: [],
            feedback: 'Boa tentativa com pequenas lacunas.',
          },
        };
      },
    };

    const progressServiceMock: Pick<ProgressService, 'getStatus' | 'getSummary'> = {
      getStatus: () => ({ module: 'progress', status: 'ready', phase: 'phase-4' }),
      getSummary: async () => ({
        learnerProfileId: 'learner_123',
        summary: {
          sessionCount: 3,
          spokenMinutes: 7.5,
          recurringIssueCount: 2,
          trackedSkillCount: 2,
        },
        recurringIssues: [
          { category: 'grammar', count: 4 },
          { category: 'reading_accuracy', count: 2 },
        ],
        skillTrends: [
          { skillName: 'conversation-accuracy', score: 0.71 },
          { skillName: 'reading-accuracy', score: 0.74 },
        ],
        recentFocusAreas: ['past simple', 'grammar'],
        learningGoal: 'Travel conversations',
      }),
    };

    const requestMetricsService = new RequestMetricsService();
    const moduleRef = await Test.createTestingModule({
      controllers: [ReadingController, ProgressController],
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

    (moduleRef.get(ReadingController) as unknown as { service: unknown }).service =
      readingServiceMock;
    (moduleRef.get(ProgressController) as unknown as { service: unknown }).service =
      progressServiceMock;

    await app.init();
  });

  after(async () => {
    await app.close();
  });

  it('POST /api/reading/sessions', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/reading/sessions')
      .send({
        targetText: 'I have a hotel reservation for tomorrow.',
        title: 'Travel drill',
      })
      .expect(201);

    assert.equal(response.body.sessionId, 'read_123');
    assert.equal(response.body.sessionType, 'reading');
  });

  it('POST /api/reading/sessions/:sessionId/attempts', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/reading/sessions/read_123/attempts')
      .send({ attemptText: 'I has a hotel booking for tomorrow.' })
      .expect(201);

    assert.equal(response.body.sessionId, 'read_123');
    assert.ok(response.body.assessment.accuracyPercent > 0);
  });

  it('POST /api/reading/sessions/:sessionId/attempts returns 400 on invalid payload', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/reading/sessions/read_123/attempts')
      .send({ attemptText: '   ' })
      .expect(400);

    assert.equal(response.body.error.code, 'BAD_REQUEST');
    assert.equal(response.body.path, '/api/reading/sessions/read_123/attempts');
  });

  it('GET /api/progress/summary', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/progress/summary')
      .expect(200);

    assert.equal(response.body.summary.sessionCount, 3);
    assert.equal(response.body.recurringIssues.length, 2);
  });
});
