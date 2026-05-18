import { Controller, Get, Param, Post } from '@nestjs/common';
import { ReviewService } from './review.service';

@Controller('review')
export class ReviewController {
  constructor(private readonly service: ReviewService) {}

  @Get('status')
  getStatus() {
    return this.service.getStatus();
  }

  @Get('queue')
  getQueue() {
    return this.service.getQueue();
  }

  @Post('queue/:itemId/complete')
  completeQueueItem(@Param('itemId') itemId: string) {
    return this.service.completeQueueItem(itemId);
  }
}
