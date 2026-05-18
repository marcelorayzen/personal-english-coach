import { Controller, Get } from '@nestjs/common';
import { ProgressService } from './progress.service';

@Controller('progress')
export class ProgressController {
  constructor(private readonly service: ProgressService) {}

  @Get('status')
  getStatus() {
    return this.service.getStatus();
  }

  @Get('summary')
  getSummary() {
    return this.service.getSummary();
  }
}
