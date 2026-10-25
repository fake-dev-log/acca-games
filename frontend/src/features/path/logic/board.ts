import { Cell, Port } from './types';

type Dir = [number, number]; // [dr, dc]

const fromSide: Record<Port['side'], Dir> = { top: [1, 0], bottom: [-1, 0], left: [0, 1], right: [0, -1] };

// '/': 오른쪽→위, 위→오른쪽, 왼쪽→아래, 아래→왼쪽 / '\': 오른쪽→아래, 아래→오른쪽, 왼쪽→위, 위→왼쪽
export const reflect = (fence: Cell, [dr, dc]: Dir): Dir =>
  fence === '/' ? [-dc, -dr] : fence === '\\' ? [dc, dr] : [dr, dc];

export const entryCell = (port: Port, size: number): [number, number] => {
  switch (port.side) {
    case 'top': return [0, port.index];
    case 'bottom': return [size - 1, port.index];
    case 'left': return [port.index, 0];
    case 'right': return [port.index, size - 1];
  }
};

export const entryDir = (port: Port): Dir => fromSide[port.side];

// 판 밖으로 나간 자리
export const exitPort = (r: number, c: number, size: number): Port | null => {
  if (r < 0) return { side: 'top', index: c };
  if (r >= size) return { side: 'bottom', index: c };
  if (c < 0) return { side: 'left', index: r };
  if (c >= size) return { side: 'right', index: r };
  return null;
};

export const samePort = (a: Port | null, b: Port) => !!a && a.side === b.side && a.index === b.index;
export const portKey = (p: Port) => `${p.side}:${p.index}`;

export const allPorts = (size: number): Port[] =>
  (['top', 'bottom', 'left', 'right'] as const).flatMap((side) => Array.from({ length: size }, (_, index) => ({ side, index })));

export interface Trace {
  cells: [number, number][]; // 지나간 칸(순서대로). 벽에 부딪혔으면 마지막이 그 벽 칸
  exit: Port | null; // null = 벽에 부딪혀 멈춤
}

// 울타리 배치대로 한 대를 몰아 본다. 거울만 있는 판에서는 바깥에서 들어온 경로가 반드시 밖으로 나가거나 벽에서 멈춘다.
export function trace(board: Cell[][], entry: Port, walls?: boolean[][]): Trace {
  const size = board.length;
  let [r, c] = entryCell(entry, size);
  let dir = entryDir(entry);
  const cells: [number, number][] = [];
  for (let step = 0; step <= 4 * size * size + 4; step++) {
    cells.push([r, c]);
    if (walls?.[r][c]) return { cells, exit: null };
    dir = reflect(board[r][c], dir);
    r += dir[0];
    c += dir[1];
    const out = exitPort(r, c, size);
    if (out) return { cells, exit: out };
  }
  throw new Error('경로가 판을 벗어나지 않습니다');
}

export const emptyBoard = (size: number): Cell[][] => Array.from({ length: size }, () => Array<Cell>(size).fill(null));
export const noWalls = (size: number): boolean[][] => Array.from({ length: size }, () => Array<boolean>(size).fill(false));

export const countFences = (board: Cell[][]) => board.flat().filter((cell) => cell !== null).length;

// 칸 안에서 누른 위치(0~1, 왼쪽 위 기준)에 더 가까운 대각선. 가운데는 '/'.
export const fenceAt = (x: number, y: number): '/' | '\\' => (Math.abs(x - y) < Math.abs(x + y - 1) ? '\\' : '/');
