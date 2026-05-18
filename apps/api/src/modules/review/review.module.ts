import { Module } from '@nestjs/common';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { ReviewQueuePolicy } from './review-queue.policy';

@Module({
  controllers: [ReviewController],
  providers: [ReviewService, ReviewQueuePolicy],
  exports: [ReviewService, ReviewQueuePolicy],
})
export class ReviewModule {}
