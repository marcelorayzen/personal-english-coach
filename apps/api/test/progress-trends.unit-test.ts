import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  computeCategoryTrends,
  computeSimpleTrend,
} from '../src/modules/progress/progress-trends';

describe('progress trends', () => {
  it('computes simple trend as up when current window is higher', () => {
    const now = new Date('2026-04-18T12:00:00.000Z');
    const trend = computeSimpleTrend(
      [
        { createdAt: new Date('2026-04-16T12:00:00.000Z'), value: 5 },
        { createdAt: new Date('2026-04-14T12:00:00.000Z'), value: 4 },
        { createdAt: new Date('2026-04-08T12:00:00.000Z'), value: 2 },
      ],
      { now, windowDays: 7 },
    );

    assert.equal(trend.currentValue, 9);
    assert.equal(trend.previousValue, 2);
    assert.equal(trend.direction, 'up');
  });

  it('computes simple trend as stable when values are equal', () => {
    const now = new Date('2026-04-18T12:00:00.000Z');
    const trend = computeSimpleTrend(
      [
        { createdAt: new Date('2026-04-15T12:00:00.000Z'), value: 3 },
        { createdAt: new Date('2026-04-09T12:00:00.000Z'), value: 3 },
      ],
      { now, windowDays: 7 },
    );

    assert.equal(trend.delta, 0);
    assert.equal(trend.direction, 'stable');
  });

  it('computes category trends with per-category direction', () => {
    const now = new Date('2026-04-18T12:00:00.000Z');
    const trends = computeCategoryTrends(
      [
        { category: 'grammar', createdAt: new Date('2026-04-17T12:00:00.000Z') },
        { category: 'grammar', createdAt: new Date('2026-04-10T12:00:00.000Z') },
        { category: 'fluency', createdAt: new Date('2026-04-09T12:00:00.000Z') },
      ],
      { now, windowDays: 7 },
    );

    const grammar = trends.find((item) => item.category === 'grammar');
    const fluency = trends.find((item) => item.category === 'fluency');

    assert.ok(grammar);
    assert.ok(fluency);
    assert.equal(grammar?.direction, 'stable');
    assert.equal(fluency?.direction, 'down');
  });
});
