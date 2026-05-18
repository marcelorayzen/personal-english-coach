import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Mistake, MistakeCategory } from '@prisma/client';
import { ReviewQueuePolicy } from '../src/modules/review/review-queue.policy';

function buildMistake(
  id: string,
  category: MistakeCategory,
  createdAt: Date,
): Mistake {
  return {
    id,
    learnerProfileId: 'learner_1',
    category,
    sourceText: 'source',
    correctedText: 'corrected',
    explanation: 'explanation',
    createdAt,
  };
}

describe('ReviewQueuePolicy', () => {
  const policy = new ReviewQueuePolicy();

  it('returns null when recurrence threshold is not met', () => {
    const now = new Date();
    const decision = policy.decide([
      buildMistake('m1', MistakeCategory.grammar, now),
      buildMistake('m2', MistakeCategory.grammar, now),
    ]);

    assert.equal(decision, null);
  });

  it('creates decision when recurrence reaches threshold', () => {
    const now = new Date();
    const decision = policy.decide([
      buildMistake('m1', MistakeCategory.grammar, now),
      buildMistake('m2', MistakeCategory.grammar, now),
      buildMistake('m3', MistakeCategory.grammar, now),
      buildMistake('m4', MistakeCategory.vocabulary, now),
    ]);

    assert.ok(decision);
    assert.equal(decision?.itemType, 'mistake:grammar');
    assert.equal(decision?.recurrenceCount, 3);
    assert.ok((decision?.priority ?? 0) >= 70);
    assert.match(decision?.prompt ?? '', /sentences focused on correct tense/i);
  });

  it('increases priority when top recurring category is recent', () => {
    const now = new Date();
    const old = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

    const recentDecision = policy.decide([
      buildMistake('m1', MistakeCategory.syntax, now),
      buildMistake('m2', MistakeCategory.syntax, now),
      buildMistake('m3', MistakeCategory.syntax, now),
    ]);

    const oldDecision = policy.decide([
      buildMistake('m1', MistakeCategory.syntax, old),
      buildMistake('m2', MistakeCategory.syntax, old),
      buildMistake('m3', MistakeCategory.syntax, old),
    ]);

    assert.ok(recentDecision);
    assert.ok(oldDecision);
    assert.ok((recentDecision?.priority ?? 0) > (oldDecision?.priority ?? 0));
  });
});
