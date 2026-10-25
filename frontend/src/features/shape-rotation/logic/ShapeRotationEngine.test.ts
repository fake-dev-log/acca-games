import { describe, it, expect } from 'vitest';
import { MAX_MIN_MOVES, MINIMAL_SOLUTIONS, ShapeRotationEngine } from './ShapeRotationEngine';
import { ShapeRotationSettings, Transform } from './types';

const settings = (round: number, numProblems = 20): ShapeRotationSettings => ({ round, numProblems, timeLimit: 180, isRealMode: false });

describe('MINIMAL_SOLUTIONS', () => {
  it('covers the 15 non-identity transforms of the octagon group, each within 3 moves', () => {
    expect(MINIMAL_SOLUTIONS).toHaveLength(15);
    expect(MAX_MIN_MOVES).toBe(3);
    expect(MINIMAL_SOLUTIONS.every((s) => s.length >= 1 && s.length <= 3)).toBe(true);
  });

  it('is sorted by length', () => {
    const lengths = MINIMAL_SOLUTIONS.map((s) => s.length);
    expect(lengths).toEqual([...lengths].sort((a, b) => a - b));
  });
});

describe('ShapeRotationEngine', () => {
  // 예전 비교 방식은 곡선 글자(Q·J·G)에서 정답의 약 3%를 오답 처리했다. 400문제면 놓칠 확률이 1e-8 아래다.
  it('generates problems whose MinMoves is the true minimum and accepts the shown solution', () => {
    const engine = new ShapeRotationEngine();
    for (const round of [1, 1, 1, 1, 1, 2, 2, 2, 2, 2]) {
      const { problems } = engine.startGame(settings(round, 40));
      for (const problem of problems) {
        expect(problem.MinMoves).toBe(problem.Solution.length);
        expect(problem.MinMoves).toBeGreaterThanOrEqual(1);
        expect(problem.MinMoves).toBeLessThanOrEqual(MAX_MIN_MOVES);
        // 정답 예시는 맞고, 그보다 짧은 어떤 변환도 같은 모양을 만들지 못한다
        expect(engine.submitAnswer(problem, problem.Solution, 0, 0).isCorrect).toBe(true);
        for (const shorter of MINIMAL_SOLUTIONS.filter((s) => s.length < problem.MinMoves)) {
          expect(engine.submitAnswer(problem, shorter, 0, 0).isCorrect).toBe(false);
        }
      }
    }
  });

  it('produces round 1 then round 2 problems for round 0', () => {
    const { problems } = new ShapeRotationEngine().startGame(settings(0, 3));
    expect(problems.map((p) => p.Round)).toEqual([1, 1, 1, 2, 2, 2]);
    expect(problems.filter((p) => p.Round === 2).every((p) => p.InitialGridPath && p.FinalGridPath)).toBe(true);
  });

  it('rejects a geometrically right answer that uses more moves than the minimum', () => {
    const engine = new ShapeRotationEngine();
    const [problem] = engine.startGame(settings(1, 1)).problems;
    const padded: Transform[] = [...problem.Solution, 'flip_horizontal', 'flip_horizontal'];
    expect(engine.submitAnswer(problem, padded, 0, 0).isCorrect).toBe(false);
  });

  it('marks an empty (timed-out) answer as wrong', () => {
    const engine = new ShapeRotationEngine();
    const [problem] = engine.startGame(settings(2, 1)).problems;
    const result = engine.submitAnswer(problem, [], 180000, 0);
    expect(result.isCorrect).toBe(false);
    expect(result.problem).toBe(problem);
  });

  it('refuses answers without an active session', () => {
    const engine = new ShapeRotationEngine();
    const problem = new ShapeRotationEngine().startGame(settings(1, 1)).problems[0];
    expect(() => engine.submitAnswer(problem, problem.Solution, 0, 0)).toThrow('No active session');
  });
});
