import { CoachGenerationResult } from '../ports/coach-generation.port';

export function applyCorrectionCap(
  generation: CoachGenerationResult,
  maxCorrections = 2,
): CoachGenerationResult {
  return {
    ...generation,
    corrections: generation.corrections.slice(0, maxCorrections),
  };
}
