import { Module } from '@nestjs/common';
import { CoachController } from './coach.controller';
import { CoachService } from './coach.service';
import { LearnerMemoryModule } from '../learner-memory/learner-memory.module';
import { ReviewModule } from '../review/review.module';
import { MockCoachGenerationAdapter } from './adapters/mock-coach-generation.adapter';
import { MockSynthesisAdapter } from './adapters/mock-synthesis.adapter';
import { MockTranscriptionAdapter } from './adapters/mock-transcription.adapter';
import {
  COACH_GENERATION_PORT,
  SYNTHESIS_PORT,
  TRANSCRIPTION_PORT,
} from './ports/tokens';

@Module({
  imports: [LearnerMemoryModule, ReviewModule],
  controllers: [CoachController],
  providers: [
    CoachService,
    MockTranscriptionAdapter,
    MockSynthesisAdapter,
    MockCoachGenerationAdapter,
    {
      provide: TRANSCRIPTION_PORT,
      useExisting: MockTranscriptionAdapter,
    },
    {
      provide: SYNTHESIS_PORT,
      useExisting: MockSynthesisAdapter,
    },
    {
      provide: COACH_GENERATION_PORT,
      useExisting: MockCoachGenerationAdapter,
    },
  ],
})
export class CoachModule {}
