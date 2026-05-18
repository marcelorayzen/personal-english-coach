import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { CoachModule } from './modules/coach/coach.module';
import { VoiceModule } from './modules/voice/voice.module';
import { SessionModule } from './modules/session/session.module';
import { LearnerMemoryModule } from './modules/learner-memory/learner-memory.module';
import { ReviewModule } from './modules/review/review.module';
import { ReadingModule } from './modules/reading/reading.module';
import { ProgressModule } from './modules/progress/progress.module';
import { ConfigModule } from './modules/config/config.module';
import { HealthModule } from './modules/health/health.module';
import { CorrelationIdMiddleware } from './common/observability/correlation-id.middleware';
import { ObservabilityModule } from './common/observability/observability.module';
import { DatabaseModule } from './common/database/database.module';

@Module({
  imports: [
    DatabaseModule,
    ObservabilityModule,
    CoachModule,
    VoiceModule,
    SessionModule,
    LearnerMemoryModule,
    ReviewModule,
    ReadingModule,
    ProgressModule,
    ConfigModule,
    HealthModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorrelationIdMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
