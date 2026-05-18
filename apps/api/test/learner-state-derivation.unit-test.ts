import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MistakeCategory } from '@prisma/client';
import { LearnerStateDerivationService } from '../src/modules/learner-memory/learner-state-derivation.service';

describe('LearnerStateDerivationService', () => {
  const service = new LearnerStateDerivationService();

  it('derives weakness ranking and summary metrics', () => {
    const now = new Date();
    const state = service.derive({
      sessionCount: 3,
      utteranceCount: 12,
      mistakes: [
        {
          id: 'm1',
          learnerProfileId: 'l1',
          category: MistakeCategory.grammar,
          sourceText: 'src',
          correctedText: 'corr',
          explanation: 'exp',
          createdAt: now,
        },
        {
          id: 'm2',
          learnerProfileId: 'l1',
          category: MistakeCategory.grammar,
          sourceText: 'src',
          correctedText: 'corr',
          explanation: 'exp',
          createdAt: now,
        },
        {
          id: 'm3',
          learnerProfileId: 'l1',
          category: MistakeCategory.vocabulary,
          sourceText: 'src',
          correctedText: 'corr',
          explanation: 'exp',
          createdAt: now,
        },
      ],
      skills: [
        {
          id: 's1',
          learnerProfileId: 'l1',
          skillName: 'conversation-accuracy',
          score: 0.7,
          updatedAt: now,
        },
        {
          id: 's2',
          learnerProfileId: 'l1',
          skillName: 'vocabulary-range',
          score: 0.9,
          updatedAt: now,
        },
      ],
    });

    assert.equal(state.summary.sessionCount, 3);
    assert.equal(state.summary.utteranceCount, 12);
    assert.equal(state.summary.mistakeCount, 3);
    assert.equal(state.summary.trackedSkillCount, 2);
    assert.equal(state.summary.averageSkillScore, 0.8);
    assert.equal(state.topWeaknesses[0]?.category, MistakeCategory.grammar);
    assert.equal(state.topWeaknesses[0]?.count, 2);
  });

  it('returns baseline recommendation without recurring mistakes', () => {
    const state = service.derive({
      sessionCount: 0,
      utteranceCount: 0,
      mistakes: [],
      skills: [],
    });

    assert.equal(state.summary.averageSkillScore, null);
    assert.equal(state.topWeaknesses.length, 0);
    assert.equal(state.recommendations.length, 1);
  });
});
