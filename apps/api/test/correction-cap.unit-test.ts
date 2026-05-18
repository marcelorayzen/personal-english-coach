import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { applyCorrectionCap } from '../src/modules/coach/pedagogy/correction-cap';

describe('applyCorrectionCap', () => {
  it('limits corrections to 2 by default', () => {
    const result = applyCorrectionCap({
      provider: 'mock',
      coachText: 'response',
      corrections: [
        { issue: 'a', guidance: 'a' },
        { issue: 'b', guidance: 'b' },
        { issue: 'c', guidance: 'c' },
      ],
      systemNotes: 'notes',
    });

    assert.equal(result.corrections.length, 2);
    assert.deepEqual(result.corrections.map((item) => item.issue), ['a', 'b']);
  });

  it('keeps corrections untouched when below cap', () => {
    const result = applyCorrectionCap({
      provider: 'mock',
      coachText: 'response',
      corrections: [{ issue: 'a', guidance: 'a' }],
      systemNotes: 'notes',
    });

    assert.equal(result.corrections.length, 1);
    assert.equal(result.corrections[0]?.issue, 'a');
  });
});
