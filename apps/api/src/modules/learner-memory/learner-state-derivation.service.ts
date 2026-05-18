import { Injectable } from '@nestjs/common';
import { Mistake, SkillMastery } from '@prisma/client';

export interface LearnerStateInput {
  utteranceCount: number;
  sessionCount: number;
  mistakes: Mistake[];
  skills: SkillMastery[];
}

@Injectable()
export class LearnerStateDerivationService {
  derive(input: LearnerStateInput) {
    const mistakesByCategory = input.mistakes.reduce<Record<string, number>>(
      (acc, mistake) => {
        acc[mistake.category] = (acc[mistake.category] ?? 0) + 1;
        return acc;
      },
      {},
    );

    const topWeaknesses = Object.entries(mistakesByCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category, count]) => ({ category, count }));

    const averageSkillScore =
      input.skills.length === 0
        ? null
        : Number(
            (
              input.skills.reduce((acc, skill) => acc + skill.score, 0) /
              input.skills.length
            ).toFixed(2),
          );

    return {
      summary: {
        sessionCount: input.sessionCount,
        utteranceCount: input.utteranceCount,
        mistakeCount: input.mistakes.length,
        trackedSkillCount: input.skills.length,
        averageSkillScore,
      },
      topWeaknesses,
      recommendations: this.buildRecommendations(topWeaknesses),
      derivedAt: new Date().toISOString(),
    };
  }

  buildSnapshotSummary(state: ReturnType<LearnerStateDerivationService['derive']>) {
    const topWeaknessText =
      state.topWeaknesses.length === 0
        ? 'No recurring weaknesses detected.'
        : state.topWeaknesses
            .map((item) => `${item.category} (${item.count})`)
            .join(', ');

    return `Sessions: ${state.summary.sessionCount}; Utterances: ${state.summary.utteranceCount}; Weaknesses: ${topWeaknessText}`;
  }

  private buildRecommendations(
    topWeaknesses: Array<{ category: string; count: number }>,
  ): string[] {
    if (topWeaknesses.length === 0) {
      return ['Keep practicing with free conversation to gather more signal.'];
    }

    return topWeaknesses.map(
      (weakness) =>
        `Focus short drills on ${weakness.category} to reduce repeated mistakes.`,
    );
  }
}
