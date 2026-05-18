import { Module } from '@nestjs/common';
import { ReviewModule } from '../review/review.module';
import { ReadingController } from './reading.controller';
import { ReadingService } from './reading.service';

@Module({
  imports: [ReviewModule],
  controllers: [ReadingController],
  providers: [ReadingService],
})
export class ReadingModule {}
