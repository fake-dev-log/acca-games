import { describe, it, expect } from 'vitest';
import { RPSEngine } from './RPSEngine';

const beats: Record<string, string> = { ROCK: 'SCISSORS', PAPER: 'ROCK', SCISSORS: 'PAPER' };

describe('RPSEngine', () => {
  it('asks for the winning card when my card is hidden and the losing card when the opponent card is hidden', () => {
    const engine = new RPSEngine();
    const { problems } = engine.startGame({ rounds: [1, 2, 3], questionsPerRound: 30, timeLimitMs: 3000, isRealMode: false });
    for (const p of problems) {
      if (p.round === 1) expect(p.problemCardHolder).toBe('me');
      if (p.round === 2) expect(p.problemCardHolder).toBe('opponent');
      if (p.problemCardHolder === 'me') expect(beats[p.correctChoice]).toBe(p.givenCard); // 내 카드가 상대 카드를 이긴다
      else expect(beats[p.givenCard]).toBe(p.correctChoice); // 상대 카드가 내 카드에 진다
    }
    const holders = new Set(problems.filter((p) => p.round === 3).map((p) => p.problemCardHolder));
    expect(holders).toEqual(new Set(['me', 'opponent']));
  });

  it('numbers questions across rounds from 1', () => {
    const engine = new RPSEngine();
    const { problems } = engine.startGame({ rounds: [2, 3], questionsPerRound: 2, timeLimitMs: 3000, isRealMode: false });
    expect(problems.map((p) => [p.round, p.questionNum])).toEqual([[2, 1], [2, 2], [3, 3], [3, 4]]);
  });

  it('throws for answers before a game starts or out of range', () => {
    const engine = new RPSEngine();
    expect(() => engine.submitAnswer('ROCK', 1, 1)).toThrow();
    engine.startGame({ rounds: [1], questionsPerRound: 1, timeLimitMs: 3000, isRealMode: false });
    expect(() => engine.submitAnswer('ROCK', 1, 2)).toThrow();
  });
});
