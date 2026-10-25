import { describe, it, expect } from 'vitest';
import { CatChaserEngine } from './CatChaserEngine';
import { CatChaserSettings } from './types';

const settings: CatChaserSettings = { numTrials: 6, difficulty: 'auto', showTime: 1, responseTimeLimit: 3, isRealMode: false };

describe('CatChaserEngine', () => {
  it('derives CAUGHT/MISSED from whether a mouse sat under the target cat', () => {
    const { problems } = new CatChaserEngine().startGame(settings);
    for (const p of problems) {
      expect(p.redCatIndex).not.toBe(p.blueCatIndex);
      expect(p.redCatStatus).toBe(p.micePositions.includes(p.catPositions[p.redCatIndex]) ? 'CAUGHT' : 'MISSED');
      expect(p.blueCatStatus).toBe(p.micePositions.includes(p.catPositions[p.blueCatIndex]) ? 'CAUGHT' : 'MISSED');
    }
  });

  it('raises the mouse count over the session in auto difficulty', () => {
    const { problems } = new CatChaserEngine().startGame(settings);
    expect(problems.map((p) => p.micePositions.length)).toEqual([4, 6, 8, 10, 12, 16]);
  });

  it('scales the score by confidence and penalises timeouts', () => {
    const engine = new CatChaserEngine();
    const { problems } = engine.startGame({ ...settings, numTrials: 1 });
    const right = problems[0].redCatStatus;
    const wrong = right === 'CAUGHT' ? 'MISSED' : 'CAUGHT';
    expect(engine.submitAnswer(1, 'RED', right, 4, 500).score).toBe(2);
    expect(engine.submitAnswer(1, 'RED', right, 1, 500).score).toBe(0.1);
    expect(engine.submitAnswer(1, 'RED', wrong, 3, 500).score).toBe(-1);
    const timeout = engine.submitAnswer(1, 'BLUE', 'TIMEOUT', 0, 3000);
    expect(timeout).toMatchObject({ isCorrect: false, score: -1 });
  });

  it('falls back to 4 mice for an invalid fixed difficulty and rejects unknown rounds', () => {
    const engine = new CatChaserEngine();
    const { problems } = engine.startGame({ ...settings, difficulty: 'abc', numTrials: 2 });
    expect(problems.every((p) => p.micePositions.length === 4)).toBe(true);
    expect(() => engine.submitAnswer(3, 'RED', 'CAUGHT', 2, 100)).toThrow('Invalid round');
  });
});
