export interface SynthesisRequest {
  sessionId: string;
  text: string;
}

export interface SynthesisResult {
  provider: string;
  format?: string | null;
  audioUrl?: string | null;
}

export interface SynthesisPort {
  synthesize(input: SynthesisRequest): Promise<SynthesisResult>;
}
