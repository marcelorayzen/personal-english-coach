import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { MockCoachGenerationAdapter } from '../src/modules/coach/adapters/mock-coach-generation.adapter';

describe('MockCoachGenerationAdapter', () => {
  const adapter = new MockCoachGenerationAdapter();

  it('includes focus and goal hints when provided', async () => {
    const result = await adapter.generate({
      sessionId: 'sess_1',
      learnerText: 'I like to travel.',
      recentContext: [],
      currentFocus: 'past simple',
      learningGoal: 'travel conversations',
      ptBrSupportLevel: 'high',
    });

    assert.match(result.coachText, /Foco: past simple/i);
    assert.match(result.coachText, /Meta: travel conversations/i);
    assert.match(result.coachText, /PT-BR/i);
  });

  it('adapts correction phrase for high correction intensity', async () => {
    const result = await adapter.generate({
      sessionId: 'sess_2',
      learnerText: 'I has a reservation.',
      recentContext: [],
      correctionIntensity: 'high',
    });

    assert.match(result.coachText, /Correcao principal deste turno/i);
    assert.equal(result.corrections.length, 1);
  });
});
