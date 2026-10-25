import { describe, it, expect } from 'vitest';
import { AppointmentEngine, DAYS, MAP_CELLS, MENUS } from './AppointmentEngine';
import { AppointmentSettings } from './types';

const settings = (rounds: number[], problemsPerRound = 6): AppointmentSettings => ({
  rounds, problemsPerRound, presentationTimeMs: 3000, responseTimeLimitMs: 7000, isRealMode: false,
});

describe('AppointmentEngine', () => {
  it('rounds 1-3: exactly one item is shared by all three people, and it is the answer', () => {
    const engine = new AppointmentEngine();
    for (let k = 0; k < 50; k++) {
      for (const p of engine.startGame(settings([1, 2, 3])).problems) {
        const universe = p.round === 1 ? DAYS : p.round === 2 ? MAP_CELLS : MENUS;
        const shared = universe.filter((u) => p.people.every((items) => items.includes(u)));
        expect(shared).toEqual([p.answer]);
        expect(p.people.every((items) => items.length === p.itemsPerPerson && new Set(items).size === items.length)).toBe(true);
        expect([...p.options].sort()).toEqual([...universe].sort());
      }
    }
  });

  it('round 4: the answer is the only option nobody rode, and every other option was ridden', () => {
    const engine = new AppointmentEngine();
    for (let k = 0; k < 50; k++) {
      for (const p of engine.startGame(settings([4])).problems) {
        const ridden = new Set(p.people.flat());
        expect(ridden.has(p.answer)).toBe(false);
        expect(p.options.filter((o) => !ridden.has(o))).toEqual([p.answer]);
        expect(new Set(p.options).size).toBe(p.options.length);
        expect(p.options).toHaveLength(p.itemsPerPerson * 2 + 1);
      }
    }
  });

  it('shows one more item per person in the second half of each round', () => {
    const { problems } = new AppointmentEngine().startGame(settings([1, 4], 4));
    expect(problems.map((p) => [p.round, p.itemsPerPerson])).toEqual([
      [1, 3], [1, 3], [1, 4], [1, 4], [4, 2], [4, 2], [4, 3], [4, 3],
    ]);
    expect(problems.map((p) => p.questionNum)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('grades answers and treats a timeout (null) as wrong', () => {
    const engine = new AppointmentEngine();
    const [first, second] = engine.startGame(settings([2], 2)).problems;
    expect(engine.submitAnswer(1, first.answer, 1200).isCorrect).toBe(true);
    const timeout = engine.submitAnswer(2, null, 7000);
    expect(timeout).toMatchObject({ isCorrect: false, playerChoice: null, answer: second.answer, round: 2 });
    expect(engine.getResults()).toHaveLength(2);
  });

  it('throws before a game starts and for unknown question numbers', () => {
    const engine = new AppointmentEngine();
    expect(() => engine.submitAnswer(1, '월', 1)).toThrow('Game not started');
    engine.startGame(settings([1], 2));
    expect(() => engine.submitAnswer(3, '월', 1)).toThrow('Invalid question number');
  });
});
