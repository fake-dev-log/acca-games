import { BreakdownRow } from './types';

interface Scorable {
  isCorrect: boolean;
}

export function accuracyOf(results: Scorable[]): number {
  if (results.length === 0) return 0;
  return (results.filter((r) => r.isCorrect).length / results.length) * 100;
}

export function averageOf<T>(items: T[], value: (item: T) => number): number {
  if (items.length === 0) return 0;
  return items.reduce((sum, item) => sum + value(item), 0) / items.length;
}

// 결과를 key 로 묶어 그룹별 정답률·평균 시간을 낸다. order 가 있으면 그 순서로, 없으면 처음 나온 순서로.
export function groupRows<T extends Scorable>(
  results: T[],
  key: (r: T) => string,
  timeMs?: (r: T) => number,
  order?: string[],
): BreakdownRow[] {
  const groups = new Map<string, T[]>();
  for (const r of results) {
    const k = key(r);
    const list = groups.get(k);
    if (list) list.push(r);
    else groups.set(k, [r]);
  }
  const labels = order ? order.filter((l) => groups.has(l)) : [...groups.keys()];
  return labels.map((label) => {
    const items = groups.get(label)!;
    return {
      label,
      total: items.length,
      correct: items.filter((r) => r.isCorrect).length,
      accuracy: accuracyOf(items),
      averageTimeMs: timeMs ? averageOf(items, timeMs) : null,
    };
  });
}
