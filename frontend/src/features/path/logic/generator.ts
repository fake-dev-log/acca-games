import { Cell, PathDifficulty, PathPuzzle, Vehicle, VehicleKind } from './types';
import { allPorts, emptyBoard, noWalls, portKey, trace } from './board';
import { solve } from './solver';

export const BOARD_SIZE = 5;

export const VEHICLE_INFO: Record<VehicleKind, { vehicle: string; customer: string; label: string; color: string }> = {
  taxi: { vehicle: '🚕', customer: '🧑', label: '택시 → 1인 손님', color: '#E0A800' },
  bus: { vehicle: '🚌', customer: '👥', label: '버스 → 단체 손님', color: '#3B7DD8' },
  bike: { vehicle: '🛵', customer: '📦', label: '오토바이 → 화물 손님', color: '#D9534F' },
};

export interface LevelConfig {
  vehicles: [number, number]; // 최소·최대 대수(최대 3 — 종류가 셋)
  fences: [number, number]; // 정답(최소) 울타리 수 범위
  walls: [number, number];
}

export const LEVELS: Record<'easy' | 'mid' | 'late' | 'hard', LevelConfig> = {
  easy: { vehicles: [2, 2], fences: [2, 3], walls: [0, 0] },
  mid: { vehicles: [2, 3], fences: [3, 4], walls: [0, 0] },
  late: { vehicles: [3, 3], fences: [4, 5], walls: [0, 1] },
  hard: { vehicles: [3, 3], fences: [4, 6], walls: [3, 5] },
};

// 보통: 실제처럼 갈수록 어려워지되(앞 1/3 · 중간 · 뒤 1/3) 다섯 문제 중 하나 꼴로 한 단계 쉬운 문제를 섞는다
export function levelFor(index: number, count: number, difficulty: PathDifficulty): LevelConfig {
  if (difficulty === 'hard') return LEVELS.hard;
  const order = [LEVELS.easy, LEVELS.mid, LEVELS.late];
  const stage = Math.min(2, Math.floor((index * 3) / count));
  const easier = stage > 0 && Math.random() < 0.2 ? 1 : 0;
  return order[stage - easier];
}

const randInt = (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1));
const shuffle = <T>(items: T[]): T[] => {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/**
 * 벽과 무작위 울타리를 깔고 교통수단을 몰아 본 출구에 짝 손님을 둔 뒤, 탐색기로 최소 울타리 수를 다시 구한다.
 * 벽에 부딪히거나, 울타리를 하나도 안 지나거나, 손님 자리가 다른 자리와 겹치거나,
 * 최소 울타리 수가 범위를 벗어나면 다시 만든다.
 */
export function generatePuzzle(level: LevelConfig, size = BOARD_SIZE): PathPuzzle {
  while (true) {
    const cells = shuffle(Array.from({ length: size * size }, (_, i) => i));
    const walls = noWalls(size);
    const wallCount = randInt(level.walls[0], level.walls[1]);
    for (const idx of cells.slice(0, wallCount)) walls[Math.floor(idx / size)][idx % size] = true;

    const board: Cell[][] = emptyBoard(size);
    const placed = randInt(level.fences[0], level.fences[1] + 1);
    for (const idx of cells.slice(wallCount, wallCount + placed)) {
      board[Math.floor(idx / size)][idx % size] = Math.random() < 0.5 ? '/' : '\\';
    }

    const kinds = shuffle<VehicleKind>(['taxi', 'bus', 'bike']).slice(0, randInt(level.vehicles[0], level.vehicles[1]));
    const entries = shuffle(allPorts(size)).slice(0, kinds.length);
    const used = new Set(entries.map(portKey));
    const vehicles: Vehicle[] = [];
    for (const [i, entry] of entries.entries()) {
      const { cells: path, exit } = trace(board, entry, walls);
      if (!exit || !path.some(([r, c]) => board[r][c] !== null) || used.has(portKey(exit))) break;
      used.add(portKey(exit));
      vehicles.push({ kind: kinds[i], entry, target: exit });
    }
    if (vehicles.length < kinds.length) continue;

    const solution = solve(size, vehicles, walls, level.fences[1]);
    if (!solution || solution.fences < level.fences[0]) continue;
    return { size, walls, vehicles, minFences: solution.fences, solution: solution.board };
  }
}
