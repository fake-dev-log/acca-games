import { describe, it, expect } from 'vitest';
import { NumberPressingEngine } from './NumberPressingEngine';

describe('NumberPressingEngine.calculateCorrectClicksR2', () => {
  const engine = new NumberPressingEngine();

  // 기획서(docs/GAME_PLAN.md §3) 예시 그대로
  it.each([
    [{ doubleClick: [1, 2], skip: [] }, [1, 1, 2, 2, 3, 4, 5, 6, 7, 8, 9]],
    [{ doubleClick: [], skip: [3, 4] }, [1, 2, 5, 6, 7, 8, 9]],
    [{ doubleClick: [2], skip: [6, 8] }, [1, 2, 2, 3, 4, 5, 7, 9]],
    [{ doubleClick: [], skip: [] }, [1, 2, 3, 4, 5, 6, 7, 8, 9]],
  ])('%o → %o', (problem, expected) => {
    expect(engine.calculateCorrectClicksR2(problem)).toEqual(expected);
  });
});

describe('NumberPressingEngine problem generation', () => {
  it('keeps conditions within the rules (≤2 double, ≤2 skip, never both on one number)', () => {
    const engine = new NumberPressingEngine();
    const { problemsR1, problemsR2 } = engine.startGame({ isRealMode: false, rounds: [1, 2], problemsPerRound: 200, timeLimitR1: 60, timeLimitR2: 120 });
    expect(problemsR1.every((p) => p.targetNumber >= 1 && p.targetNumber <= 9)).toBe(true);
    for (const p of problemsR2) {
      expect(p.doubleClick.length).toBeLessThanOrEqual(2);
      expect(p.skip.length).toBeLessThanOrEqual(2);
      expect(p.doubleClick.some((n) => p.skip.includes(n))).toBe(false);
    }
  });

  it('refuses results before a game starts', () => {
    const engine = new NumberPressingEngine();
    expect(() => engine.submitResultR1({ sessionId: 1, problem: { targetNumber: 1 }, timeTaken: 1, isCorrect: true })).toThrow('Game not started');
  });
});
