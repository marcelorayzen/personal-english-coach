import { Module } from '@nestjs/common';
import { LearnerMemoryController } from './learner-memory.controller';
import { LearnerMemoryService } from './learner-memory.service';
import { LearnerStateDerivationService } from './learner-state-derivation.service';

@Module({
  controllers: [LearnerMemoryController],
  providers: [LearnerMemoryService, LearnerStateDerivationService],
  exports: [LearnerStateDerivationService],
})
export class LearnerMemoryModule {}
