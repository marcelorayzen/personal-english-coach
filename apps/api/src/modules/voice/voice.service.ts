import { Injectable } from '@nestjs/common';

@Injectable()
export class VoiceService {
  getStatus() {
    return { module: 'voice', status: 'stub', phase: 'foundation' };
  }
}
