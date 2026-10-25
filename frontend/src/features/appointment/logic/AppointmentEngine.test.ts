import { describe, it, expect } from 'vitest';
import { AppointmentEngine, DAYS, PLACES, MENUS, REAL_SETTINGS } from './AppointmentEngine';
import { AppointmentSettings } from './types';

const settings = (rounds: number[], problemsPerRound = 10): AppointmentSettings => ({
  rounds, problemsPerRound, presentationTimeMs: 1000, responseTimeLimitMs: 3000, isRealMode: false,
});

describe('AppointmentEngine', () => {
  it('rounds 1-3: exactly one item is shared by all three people, and it is the answer', () => {
    const engine = new AppointmentEngine();
    for (let k = 0; k < 30; k++) {
      for (const p of engine.startGame(settings([1, 2, 3])).problems) {
        const universe = p.round === 1 ? DAYS : p.round === 2 ? PLACES : MENUS;
        const shared = universe.filter((u) => p.people.every((items) => items.includes(u)));
        expect(shared).toEqual([p.answer]);
        expect(p.people.every((items) => items.length === p.itemsPerPerson && new Set(items).size === items.length)).toBe(true);
      }
    }
  });

  it('offers all 7 days / all 16 places, but only the menus that were shown', () => {
    const engine = new AppointmentEngine();
    for (let k = 0; k < 30; k++) {
      for (const p of engine.startGame(settings([1, 2, 3])).problems) {
        if (p.round === 1) expect(p.options).toEqual(DAYS);
        if (p.round === 2) expect(p.options).toEqual(PLACES);
        if (p.round === 3) {
          expect([...p.options].sort()).toEqual([...new Set(p.people.flat())].sort());
          expect(p.options.length).toBeGreaterThan(1); // 한두 사람만 고른 메뉴가 함정으로 섞인다
        }
      }
    }
  });

  it('round 4: the answer is the only option nobody rode, and every other option was ridden', () => {
    const engine = new AppointmentEngine();
    for (let k = 0; k < 30; k++) {
      for (const p of engine.startGame(settings([4])).problems) {
        const ridden = new Set(p.people.flat());
        expect(p.options.filter((o) => !ridden.has(o))).toEqual([p.answer]);
        expect(new Set(p.options).size).toBe(p.options.length);
      }
    }
  });

  it('never repeats the answer or its position in consecutive questions of a round', () => {
    const engine = new AppointmentEngine();
    for (let k = 0; k < 30; k++) {
      const { problems } = engine.startGame(settings([1, 2, 3, 4]));
      for (let i = 1; i < problems.length; i++) {
        const [a, b] = [problems[i - 1], problems[i]];
        if (a.round !== b.round) continue;
        expect(b.answer).not.toBe(a.answer);
        expect(b.options.indexOf(b.answer)).not.toBe(a.options.indexOf(a.answer));
      }
    }
  });

  it('shows 3 items per person, and 4 from the 6th question of each round', () => {
    const { problems } = new AppointmentEngine().startGame(REAL_SETTINGS);
    expect(problems).toHaveLength(40);
    for (const p of problems) {
      const indexInRound = (p.questionNum - 1) % 10;
      expect(p.itemsPerPerson).toBe(indexInRound >= 5 ? 4 : 3);
    }
  });

  it('grades answers and treats a timeout (null) as wrong', () => {
    const engine = new AppointmentEngine();
    const [first, second] = engine.startGame(settings([2], 2)).problems;
    expect(engine.submitAnswer(1, first.answer, 1200).isCorrect).toBe(true);
    expect(engine.submitAnswer(2, null, 3000)).toMatchObject({ isCorrect: false, playerChoice: null, answer: second.answer, round: 2 });
  });

  it('throws before a game starts and for unknown question numbers', () => {
    const engine = new AppointmentEngine();
    expect(() => engine.submitAnswer(1, '월', 1)).toThrow('Game not started');
    engine.startGame(settings([1], 2));
    expect(() => engine.submitAnswer(3, '월', 1)).toThrow('Invalid question number');
  });
});
