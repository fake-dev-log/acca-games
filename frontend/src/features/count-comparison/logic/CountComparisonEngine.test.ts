import { describe, it, expect } from 'vitest';
import { CountComparisonEngine } from './CountComparisonEngine';
import { CountComparisonSettings } from './types';

const settings: CountComparisonSettings = { numProblems: 20, presentationTime: 1000, inputTime: 3000, isRealMode: false };
const visible = (words: { isGap: boolean }[]) => words.filter((w) => !w.isGap).length;

describe('CountComparisonEngine', () => {
  // 상한(30)에서 둘이 같아지면 예전에는 답이 없는 문제가 약 4% 나왔다. 2,000문제면 놓칠 확률이 1e-30 아래다.
  it('never produces a tie, and the correct side has more words', () => {
    const engine = new CountComparisonEngine();
    for (let k = 0; k < 100; k++) {
      engine.startGame(settings);
      let problem;
      while ((problem = engine.getNextProblem())) {
        const left = visible(problem.leftWords);
        const right = visible(problem.rightWords);
        expect(left).not.toBe(right);
        expect(problem.correctSide).toBe(right > left ? 'right' : 'left');
        engine.submitAnswer('left', 100);
      }
    }
  });

  it('records the counts and grades the answer', () => {
    const engine = new CountComparisonEngine();
    engine.startGame({ ...settings, numProblems: 2 });
    const first = engine.getNextProblem()!;
    expect(engine.submitAnswer(first.correctSide, 450)).toBe(true);
    const second = engine.getNextProblem()!;
    expect(engine.submitAnswer(second.correctSide === 'left' ? 'right' : 'left', 900)).toBe(false);

    const [r1, r2] = engine.getResults();
    expect(r1).toMatchObject({ problemNumber: 1, isCorrect: true, responseTimeMs: 450, leftWordCount: visible(first.leftWords) });
    expect(r2).toMatchObject({ problemNumber: 2, isCorrect: false });
    expect(engine.getNextProblem()).toBeNull();
  });

  it('puts traps only on the side with fewer words', () => {
    const engine = new CountComparisonEngine();
    engine.startGame({ ...settings, numProblems: 50 });
    let problem;
    while ((problem = engine.getNextProblem())) {
      const fewer = problem.correctSide === 'left' ? 'right' : 'left';
      expect(problem.appliedTraps.every((t) => t.appliedTo === fewer)).toBe(true);
      engine.submitAnswer('left', 1);
    }
  });

  it('returns false for answers after the last problem', () => {
    const engine = new CountComparisonEngine();
    engine.startGame({ ...settings, numProblems: 1 });
    engine.submitAnswer('left', 1);
    expect(engine.submitAnswer('left', 1)).toBe(false);
    expect(engine.getResults()).toHaveLength(1);
  });
});
