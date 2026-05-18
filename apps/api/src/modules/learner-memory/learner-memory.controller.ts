import { Controller, Get } from '@nestjs/common';
import { LearnerMemoryService } from './learner-memory.service';

@Controller('learner')
export class LearnerMemoryController {
  constructor(private readonly service: LearnerMemoryService) {}

  @Get('status')
  getStatus() {
    return this.service.getStatus();
  }

  @Get('profile')
  getProfile() {
    return this.service.getProfile();
  }

  @Get('state')
  getState() {
    return this.service.getState();
  }

  @Get('snapshots')
  getSnapshots() {
    return this.service.getSnapshots();
  }
}
