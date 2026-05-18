export interface TranscriptionRequest {
  sessionId: string;
  learnerText: string;
  languageCode?: string;
  durationMs?: number;
}

export interface TranscriptionResult {
  transcript: string;
  provider: string;
  confidence?: number;
  languageCode?: string;
  durationMs?: number;
}

export interface TranscriptionPort {
  transcribe(input: TranscriptionRequest): Promise<TranscriptionResult>;
}
