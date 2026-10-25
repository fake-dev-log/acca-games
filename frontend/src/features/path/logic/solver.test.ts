import { describe, it, expect } from 'vitest';
import { solve } from './solver';
import { generatePuzzle, LEVELS, levelFor } from './generator';
import { countFences, emptyBoard, fenceAt, noWalls, samePort, trace } from './board';
import { Cell, Fence, Vehicle } from './types';

const routesAll = (board: Cell[][], vehicles: Vehicle[], walls: boolean[][]) =>
  vehicles.every((v) => samePort(trace(board, v.entry, walls).exit, v.target));

// 울타리 k개짜리 배치를 전부 만들어 보는 완전 탐색 — solve 의 최소성을 확인하는 기준
function bruteForceMin(size: number, vehicles: Vehicle[], walls: boolean[][], maxFences: number): number | null {
  const open = Array.from({ length: size * size }, (_, i) => i).filter((i) => !walls[Math.floor(i / size)][i % size]);
  for (let k = 0; k <= maxFences; k++) {
    let found = false;
    const choose = (start: number, left: number, board: Cell[][]) => {
      if (found) return;
      if (left === 0) {
        found = routesAll(board, vehicles, walls);
        return;
      }
      for (let j = start; j <= open.length - left && !found; j++) {
        const [r, c] = [Math.floor(open[j] / size), open[j] % size];
        for (const fence of ['/', '\\'] as Fence[]) {
          board[r][c] = fence;
          choose(j + 1, left - 1, board);
          board[r][c] = null;
        }
      }
    };
    choose(0, k, emptyBoard(size));
    if (found) return k;
  }
  return null;
}

describe('solve', () => {
  it('matches brute force on random easy puzzles', () => {
    for (let k = 0; k < 25; k++) {
      const p = generatePuzzle(LEVELS.easy);
      expect(bruteForceMin(p.size, p.vehicles, p.walls, 3)).toBe(p.minFences);
    }
  });

  it('matches brute force on puzzles with walls', () => {
    for (let k = 0; k < 6; k++) {
      const p = generatePuzzle({ vehicles: [2, 2], fences: [2, 3], walls: [3, 5] });
      expect(p.walls.flat().filter(Boolean).length).toBeGreaterThanOrEqual(3);
      expect(bruteForceMin(p.size, p.vehicles, p.walls, 3)).toBe(p.minFences);
    }
  });

  it('returns a board that routes every vehicle with minFences fences and none on walls', () => {
    for (const level of Object.values(LEVELS)) {
      for (let k = 0; k < 15; k++) {
        const p = generatePuzzle(level);
        expect(routesAll(p.solution, p.vehicles, p.walls)).toBe(true);
        expect(countFences(p.solution)).toBe(p.minFences);
        expect(p.solution.flat().every((cell, i) => cell === null || !p.walls.flat()[i])).toBe(true);
        expect(p.minFences).toBeGreaterThanOrEqual(level.fences[0]);
        expect(p.minFences).toBeLessThanOrEqual(level.fences[1]);
      }
    }
  });

  it('treats walls as blocking', () => {
    const vehicles: Vehicle[] = [{ kind: 'taxi', entry: { side: 'left', index: 1 }, target: { side: 'right', index: 1 } }];
    expect(solve(4, vehicles, noWalls(4))).toMatchObject({ fences: 0 });
    const walls = noWalls(4);
    walls[1][2] = true; // 직진 길을 막으면 돌아가야 한다
    expect(solve(4, vehicles, walls)).toMatchObject({ fences: 4 }); // 위나 아래로 한 줄 비켜 갔다 돌아온다
    expect(solve(4, vehicles, walls, 3)).toBeNull();
  });
});

describe('generatePuzzle', () => {
  it('uses 2–3 distinct vehicle kinds and distinct spots on a 5×5 board', () => {
    for (let k = 0; k < 30; k++) {
      const { vehicles, size } = generatePuzzle(LEVELS.mid);
      expect(size).toBe(5);
      expect(new Set(vehicles.map((v) => v.kind)).size).toBe(vehicles.length);
      const spots = vehicles.flatMap((v) => [v.entry, v.target]).map((p) => `${p.side}${p.index}`);
      expect(new Set(spots).size).toBe(spots.length);
    }
  });

  it('gets harder over a normal session and stays hard in hard mode', () => {
    expect(levelFor(0, 48, 'normal')).toBe(LEVELS.easy);
    expect([LEVELS.mid, LEVELS.late]).toContain(levelFor(47, 48, 'normal'));
    expect(levelFor(0, 48, 'hard')).toBe(LEVELS.hard);
  });
});

describe('fenceAt', () => {
  it('picks the diagonal closer to where the cell was pressed', () => {
    expect(fenceAt(0.9, 0.1)).toBe('/'); // 오른쪽 위
    expect(fenceAt(0.1, 0.9)).toBe('/'); // 왼쪽 아래
    expect(fenceAt(0.1, 0.1)).toBe('\\'); // 왼쪽 위
    expect(fenceAt(0.85, 0.8)).toBe('\\'); // 오른쪽 아래
    expect(fenceAt(0.5, 0.5)).toBe('/'); // 가운데
    expect(fenceAt(NaN, NaN)).toBe('/'); // 크기를 못 재는 환경
  });
});
