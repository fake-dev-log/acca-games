import { describe, it, expect } from 'vitest';
import { accuracyOf, averageOf, groupRows } from './stats';

const r = (label: string, isCorrect: boolean, ms: number) => ({ label, isCorrect, ms });

describe('stats helpers', () => {
  it('computes accuracy and averages, 0 for empty input', () => {
    expect(accuracyOf([r('a', true, 1), r('a', false, 3)])).toBe(50);
    expect(averageOf([r('a', true, 1), r('a', false, 3)], (x) => x.ms)).toBe(2);
    expect(accuracyOf([])).toBe(0);
    expect(averageOf([], () => 1)).toBe(0);
  });

  it('groups rows in the given order and skips groups without data', () => {
    const rows = groupRows([r('b', true, 100), r('a', false, 300), r('b', false, 200)], (x) => x.label, (x) => x.ms, ['a', 'c', 'b']);
    expect(rows).toEqual([
      { label: 'a', total: 1, correct: 0, accuracy: 0, averageTimeMs: 300 },
      { label: 'b', total: 2, correct: 1, accuracy: 50, averageTimeMs: 150 },
    ]);
  });

  it('keeps first-seen order and null time when no time accessor is given', () => {
    const rows = groupRows([r('z', true, 1), r('y', true, 1)], (x) => x.label);
    expect(rows.map((x) => [x.label, x.averageTimeMs])).toEqual([['z', null], ['y', null]]);
  });
});
