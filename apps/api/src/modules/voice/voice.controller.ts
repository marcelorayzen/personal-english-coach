import { Controller, Get } from '@nestjs/common';
import { VoiceService } from './voice.service';

@Controller('voice')
export class VoiceController {
  constructor(private readonly service: VoiceService) {}

  @Get('status')
  getStatus() {
    return this.service.getStatus();
  }
}
