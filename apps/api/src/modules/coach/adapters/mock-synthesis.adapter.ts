import { Injectable } from '@nestjs/common';
import {
  SynthesisPort,
  SynthesisRequest,
  SynthesisResult,
} from '../ports/synthesis.port';

@Injectable()
export class MockSynthesisAdapter implements SynthesisPort {
  async synthesize(_input: SynthesisRequest): Promise<SynthesisResult> {
    void _input;

    return {
      provider: 'mock-synthesis',
      format: 'text/plain',
      audioUrl: null,
    };
  }
}
