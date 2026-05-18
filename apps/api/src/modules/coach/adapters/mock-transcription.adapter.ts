import { Injectable } from '@nestjs/common';
import {
  TranscriptionPort,
  TranscriptionRequest,
  TranscriptionResult,
} from '../ports/transcription.port';

@Injectable()
export class MockTranscriptionAdapter implements TranscriptionPort {
  async transcribe(input: TranscriptionRequest): Promise<TranscriptionResult> {
    const transcript = input.learnerText.trim();

    return {
      transcript,
      provider: 'mock-transcription',
      confidence: 0.99,
      languageCode: input.languageCode ?? 'en',
      durationMs: input.durationMs,
    };
  }
}
