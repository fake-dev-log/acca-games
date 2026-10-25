import { describe, it, expect } from 'vitest';
import { COMBOS, PotionEngine, comboKey } from './PotionEngine';
import { calculatePotionStats } from './stats';
import { PotionSettings } from './types';

const settings = (overrides: Partial<PotionSettings> = {}): PotionSettings => ({
  numTrials: 60, responseTimeLimitMs: 3000, dominantProbability: 0.8, recipeChange: true, ...overrides,
});

describe('COMBOS', () => {
  it('lists the 14 ways to reveal 1–3 of 4 cards', () => {
    expect(COMBOS).toHaveLength(14);
    expect(new Set(COMBOS.map(comboKey)).size).toBe(14);
    expect(COMBOS.map((c) => c.length).sort()).toEqual([1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3]);
  });
});

describe('PotionEngine', () => {
  it('keeps one dominant colour per combo in each phase and flips exactly the changed combos', () => {
    const engine = new PotionEngine();
    for (let k = 0; k < 30; k++) {
      const { trials, changeAt } = engine.startGame(settings());
      expect(changeAt).toBeGreaterThanOrEqual(25); // 60 × 0.4 + 1
      expect(changeAt).toBeLessThanOrEqual(37); // 60 × 0.6 + 1
      const recipe = { before: new Map<string, string>(), after: new Map<string, string>() };
      for (const t of trials) {
        expect(t.phase).toBe(t.trialNum >= changeAt! ? 'after' : 'before');
        const map = recipe[t.phase];
        const key = comboKey(t.combo);
        if (map.has(key)) expect(map.get(key)).toBe(t.dominant);
        map.set(key, t.dominant);
      }
      // 변경 전 레시피는 빨강 7 · 파랑 7 (60문제면 14가지가 모두 나온다)
      const colors = [...recipe.before.values()];
      expect(colors.filter((c) => c === 'RED')).toHaveLength(7);
      const flipped = [...recipe.after.keys()].filter((key) => recipe.before.has(key) && recipe.before.get(key) !== recipe.after.get(key));
      const changed = new Set(trials.filter((t) => t.changedCombo).map((t) => comboKey(t.combo)));
      expect(new Set(flipped)).toEqual(new Set([...changed].filter((key) => recipe.before.has(key))));
      expect(changed.size).toBeLessThanOrEqual(4);
    }
  });

  it('scores everything except a combo\'s first appearance and a changed combo\'s first appearance after the change', () => {
    const { trials } = new PotionEngine().startGame(settings({ numTrials: 120 }));
    const seen = new Set<string>();
    const seenAfter = new Set<string>();
    for (const t of trials) {
      const key = comboKey(t.combo);
      const expected = seen.has(key) && !(t.changedCombo && !seenAfter.has(key));
      expect(t.scored).toBe(expected);
      seen.add(key);
      if (t.changedCombo) seenAfter.add(key);
    }
  });

  it('produces the dominant colour at roughly the configured rate', () => {
    const engine = new PotionEngine();
    let hits = 0;
    let total = 0;
    for (let k = 0; k < 20; k++) {
      for (const t of engine.startGame(settings({ numTrials: 120, dominantProbability: 0.8 })).trials) {
        total++;
        if (t.outcome === t.dominant) hits++;
      }
    }
    expect(hits / total).toBeGreaterThan(0.75);
    expect(hits / total).toBeLessThan(0.85);
  });

  it('never changes the recipe when recipeChange is off', () => {
    const { trials, changeAt } = new PotionEngine().startGame(settings({ recipeChange: false }));
    expect(changeAt).toBeNull();
    expect(trials.every((t) => t.phase === 'before' && !t.changedCombo)).toBe(true);
  });

  it('grades against the recipe, not the random outcome, and treats a timeout as wrong', () => {
    const engine = new PotionEngine();
    const { trials } = engine.startGame(settings({ numTrials: 20 }));
    const surprise = trials.find((t) => t.outcome !== t.dominant) ?? trials[0];
    expect(engine.submitAnswer(surprise.trialNum, surprise.dominant, 800).isCorrect).toBe(true);
    expect(engine.submitAnswer(trials[1].trialNum, null, 3000)).toMatchObject({ isCorrect: false, playerChoice: null });
    expect(() => engine.submitAnswer(21, 'RED', 1)).toThrow('Invalid trial number');
    expect(() => new PotionEngine().submitAnswer(1, 'RED', 1)).toThrow('Game not started');
  });
});

describe('calculatePotionStats', () => {
  it('counts only scored trials and splits after-change accuracy by changed / unchanged combos', () => {
    const base = { sessionId: 1, combo: [0], outcome: 'RED' as const, responseTimeMs: 1, playerChoice: 'RED' as const, dominant: 'RED' as const };
    const results = [
      { ...base, trialNum: 1, phase: 'before' as const, changedCombo: false, scored: false, isCorrect: false },
      { ...base, trialNum: 2, phase: 'before' as const, changedCombo: false, scored: true, isCorrect: true },
      { ...base, trialNum: 3, phase: 'after' as const, changedCombo: true, scored: true, isCorrect: false },
      { ...base, trialNum: 4, phase: 'after' as const, changedCombo: false, scored: true, isCorrect: true },
    ];
    expect(calculatePotionStats(results)).toEqual({
      scoredCount: 3, accuracy: (2 / 3) * 100, beforeAccuracy: 100, afterChangedAccuracy: 0, afterUnchangedAccuracy: 100, hasChange: true,
    });
    expect(calculatePotionStats([])).toMatchObject({ scoredCount: 0, accuracy: 0, hasChange: false });
  });
});
