import { Injectable } from '@nestjs/common';

@Injectable()
export class SessionService {
  getStatus() {
    return { module: 'session', status: 'stub', phase: 'foundation' };
  }
}
