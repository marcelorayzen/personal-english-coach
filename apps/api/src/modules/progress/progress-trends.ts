interface TimeWindowInput {
  now: Date;
  windowDays: number;
}

interface DatedMetric {
  createdAt: Date;
  value: number;
}

export type TrendDirection = 'up' | 'down' | 'stable';

export interface SimpleTrend {
  windowDays: number;
  currentValue: number;
  previousValue: number;
  delta: number;
  direction: TrendDirection;
}

export interface CategoryTrend extends SimpleTrend {
  category: string;
}

export function computeSimpleTrend(
  metrics: DatedMetric[],
  input: TimeWindowInput,
): SimpleTrend {
  const { now, windowDays } = input;
  const windowMs = windowDays * 24 * 60 * 60 * 1000;

  const currentStart = new Date(now.getTime() - windowMs);
  const previousStart = new Date(now.getTime() - windowMs * 2);

  let currentValue = 0;
  let previousValue = 0;

  for (const item of metrics) {
    if (item.createdAt >= currentStart && item.createdAt <= now) {
      currentValue += item.value;
      continue;
    }
    if (item.createdAt >= previousStart && item.createdAt < currentStart) {
      previousValue += item.value;
    }
  }

  const delta = Number((currentValue - previousValue).toFixed(2));
  const direction = resolveDirection(delta);

  return {
    windowDays,
    currentValue: Number(currentValue.toFixed(2)),
    previousValue: Number(previousValue.toFixed(2)),
    delta,
    direction,
  };
}

export function computeCategoryTrends(
  mistakes: Array<{ category: string; createdAt: Date }>,
  input: TimeWindowInput,
): CategoryTrend[] {
  const grouped = mistakes.reduce<Record<string, DatedMetric[]>>((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push({ createdAt: item.createdAt, value: 1 });
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([category, metrics]) => ({
      category,
      ...computeSimpleTrend(metrics, input),
    }))
    .sort((a, b) => {
      if (b.currentValue !== a.currentValue) {
        return b.currentValue - a.currentValue;
      }
      return b.delta - a.delta;
    });
}

function resolveDirection(delta: number): TrendDirection {
  if (delta > 0) {
    return 'up';
  }
  if (delta < 0) {
    return 'down';
  }
  return 'stable';
}
