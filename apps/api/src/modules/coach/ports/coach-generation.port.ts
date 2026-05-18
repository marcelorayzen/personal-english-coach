import { CorrectionIntensity, PtBrSupportLevel } from '@prisma/client';

export interface CoachCorrection {
  issue: string;
  guidance: string;
}

export interface CoachGenerationRequest {
  sessionId: string;
  learnerText: string;
  recentContext: string[];
  correctionIntensity?: CorrectionIntensity;
  ptBrSupportLevel?: PtBrSupportLevel;
  currentFocus?: string | null;
  learningGoal?: string | null;
  preferredInteractionStyle?: string | null;
}

export interface CoachGenerationResult {
  provider: string;
  coachText: string;
  corrections: CoachCorrection[];
  systemNotes?: string;
}

export interface CoachGenerationPort {
  generate(input: CoachGenerationRequest): Promise<CoachGenerationResult>;
}
