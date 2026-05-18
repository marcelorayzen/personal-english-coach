import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { assessReadingAttempt } from '../src/modules/reading/reading-assessment';

describe('assessReadingAttempt', () => {
  it('returns high accuracy for exact attempt', () => {
    const result = assessReadingAttempt(
      'I have a hotel reservation for tomorrow.',
      'I have a hotel reservation for tomorrow.',
    );

    assert.equal(result.accuracyPercent, 100);
    assert.equal(result.coveragePercent, 100);
    assert.equal(result.missingWords.length, 0);
  });

  it('returns lower accuracy and missing words when attempt diverges', () => {
    const result = assessReadingAttempt(
      'I have a hotel reservation for tomorrow.',
      'I has hotel booking tomorrow.',
    );

    assert.ok(result.accuracyPercent < 90);
    assert.ok(result.coveragePercent < 100);
    assert.ok(result.missingWords.length > 0);
  });
});
