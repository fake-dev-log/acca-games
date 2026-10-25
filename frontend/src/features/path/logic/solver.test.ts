import { describe, it, expect } from 'vitest';
import { solve } from './solver';
import { generatePuzzle, ROUND_CONFIGS } from './generator';
import { clickCost, countFences, emptyBoard, samePort, trace } from './board';
import { Cell, Fence, Vehicle } from './types';

const routesAll = (board: Cell[][], vehicles: Vehicle[]) => vehicles.every((v) => samePort(trace(board, v.entry).exit, v.target));

// 울타리 k개짜리 배치를 전부 만들어 보는 완전 탐색 — 작은 판에서 solve 의 최소성을 확인하는 기준
function bruteForce(size: number, vehicles: Vehicle[], maxFences: number) {
  const cells = size * size;
  for (let k = 0; k <= maxFences; k++) {
    let bestClicks: number | null = null;
    const choose = (start: number, left: number, board: Cell[][]) => {
      if (left === 0) {
        if (routesAll(board, vehicles)) {
          const clicks = board.flat().reduce((sum, cell) => sum + clickCost(cell), 0);
          if (bestClicks === null || clicks < bestClicks) bestClicks = clicks;
        }
        return;
      }
      for (let i = start; i <= cells - left; i++) {
        for (const fence of ['/', '\\'] as Fence[]) {
          board[Math.floor(i / size)][i % size] = fence;
          choose(i + 1, left - 1, board);
          board[Math.floor(i / size)][i % size] = null;
        }
      }
    };
    choose(0, k, emptyBoard(size));
    if (bestClicks !== null) return { fences: k, clicks: bestClicks };
  }
  return null;
}

describe('solve', () => {
  it('matches brute force on random 4×4 puzzles (fence count and click count)', () => {
    for (let k = 0; k < 40; k++) {
      const puzzle = generatePuzzle(ROUND_CONFIGS[1]);
      const brute = bruteForce(puzzle.size, puzzle.vehicles, 3);
      expect(brute).toEqual({ fences: puzzle.minFences, clicks: puzzle.minClicks });
    }
  });

  it('matches brute force on a few 5×5 puzzles', () => {
    for (let k = 0; k < 3; k++) {
      const puzzle = generatePuzzle({ ...ROUND_CONFIGS[2], fences: [3, 3] });
      expect(bruteForce(puzzle.size, puzzle.vehicles, 3)).toEqual({ fences: puzzle.minFences, clicks: puzzle.minClicks });
    }
  });

  it('returns a board that actually routes every vehicle with minFences fences', () => {
    for (const round of [1, 2, 3]) {
      for (let k = 0; k < 20; k++) {
        const p = generatePuzzle(ROUND_CONFIGS[round]);
        expect(routesAll(p.solution, p.vehicles)).toBe(true);
        expect(countFences(p.solution)).toBe(p.minFences);
        expect(p.solution.flat().reduce((s, c) => s + clickCost(c), 0)).toBe(p.minClicks);
        expect(p.minFences).toBeGreaterThanOrEqual(ROUND_CONFIGS[round].fences[0]);
        expect(p.minFences).toBeLessThanOrEqual(ROUND_CONFIGS[round].fences[1]);
      }
    }
  });

  it('needs no fence when the customer is straight across, and fails when unreachable within the budget', () => {
    const straight: Vehicle[] = [{ color: 'red', entry: { side: 'left', index: 1 }, target: { side: 'right', index: 1 } }];
    expect(solve(4, straight)).toMatchObject({ fences: 0, clicks: 0 });
    const uTurn: Vehicle[] = [{ color: 'red', entry: { side: 'left', index: 0 }, target: { side: 'left', index: 3 } }];
    expect(solve(4, uTurn, 1)).toBeNull(); // 같은 쪽으로 돌아오려면 최소 2개
    expect(solve(4, uTurn)).toMatchObject({ fences: 2 });
  });
});

describe('generatePuzzle', () => {
  it('gives every vehicle a distinct customer spot that is not another vehicle\'s spot', () => {
    for (let k = 0; k < 30; k++) {
      const { vehicles } = generatePuzzle(ROUND_CONFIGS[3]);
      const spots = vehicles.flatMap((v) => [v.entry, v.target]).map((p) => `${p.side}${p.index}`);
      expect(new Set(spots).size).toBe(spots.length);
      expect(vehicles.length).toBeGreaterThanOrEqual(3);
    }
  });
});
