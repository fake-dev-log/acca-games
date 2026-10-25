import { Cell, PathPuzzle, Port, Vehicle } from './types';
import { allPorts, emptyBoard, portKey, trace } from './board';
import { solve } from './solver';

export const VEHICLE_COLORS = ['#D9534F', '#428BCA', '#5CB85C', '#F0AD4E'];

export interface RoundConfig {
  size: number;
  vehicles: [number, number]; // 최소·최대 대수
  fences: [number, number]; // 정답(최소) 울타리 수 범위
}

export const ROUND_CONFIGS: Record<number, RoundConfig> = {
  1: { size: 4, vehicles: [2, 2], fences: [2, 3] },
  2: { size: 5, vehicles: [3, 3], fences: [3, 4] },
  3: { size: 6, vehicles: [3, 4], fences: [4, 5] },
};

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
 * 무작위 울타리를 깔고 교통수단을 몰아 본 출구에 손님을 둔 뒤, 탐색기로 최소 울타리 수를 다시 구한다.
 * 손님 자리가 다른 교통수단·손님 자리와 겹치거나, 울타리를 하나도 안 지나는 차가 있거나,
 * 최소 울타리 수가 라운드 범위를 벗어나면 다시 만든다.
 */
export function generatePuzzle(config: RoundConfig): PathPuzzle {
  const { size } = config;
  while (true) {
    const board: Cell[][] = emptyBoard(size);
    const placed = randInt(config.fences[0], config.fences[1] + 1);
    for (const idx of shuffle(Array.from({ length: size * size }, (_, i) => i)).slice(0, placed)) {
      board[Math.floor(idx / size)][idx % size] = Math.random() < 0.5 ? '/' : '\\';
    }

    const count = randInt(config.vehicles[0], config.vehicles[1]);
    const entries = shuffle(allPorts(size)).slice(0, count);
    const used = new Set(entries.map(portKey));
    const vehicles: Vehicle[] = [];
    let ok = true;
    for (const [i, entry] of entries.entries()) {
      const { cells, exit } = trace(board, entry);
      const turned = cells.some(([r, c]) => board[r][c] !== null);
      if (!turned || used.has(portKey(exit))) {
        ok = false;
        break;
      }
      used.add(portKey(exit));
      vehicles.push({ color: VEHICLE_COLORS[i], entry, target: exit });
    }
    if (!ok) continue;

    const solution = solve(size, vehicles, config.fences[1]);
    if (!solution || solution.fences < config.fences[0]) continue;
    return { size, vehicles, minFences: solution.fences, minClicks: solution.clicks, solution: solution.board };
  }
}

export const portLabel = (port: Port) => `${{ top: '위', bottom: '아래', left: '왼쪽', right: '오른쪽' }[port.side]} ${port.index + 1}`;
