import { Cell, Vehicle } from './types';
import { entryCell, entryDir, exitPort, reflect, samePort } from './board';

export interface Solution {
  fences: number;
  clicks: number;
  board: Cell[][];
}

const FENCES: Cell[] = [null, '/', '\\'];

/**
 * 모든 교통수단을 같은 색 손님에게 보내는 최소 울타리 배치를 찾는다.
 * 울타리 개수 예산을 0부터 늘려 가며(반복 심화) 깊이 우선으로 탐색한다. 교통수단이 처음 지나는 칸에서만
 * 빈칸 · '/' · '\' 세 갈래로 나뉘고, 한 번 정한 칸은 뒤 교통수단도 그대로 따른다.
 * 최소 개수에서는 클릭 수('/' 1번, '\' 2번)가 가장 적은 배치를 고른다.
 */
export function solve(size: number, vehicles: Vehicle[], maxFences = 8): Solution | null {
  const decided = new Int8Array(size * size); // 0 미정 · 1 빈칸 · 2 '/' · 3 '\'
  for (let budget = 0; budget <= maxFences; budget++) {
    let best: Solution | null = null;

    const walk = (v: number, r: number, c: number, dir: [number, number], used: number, clicks: number): void => {
      while (true) {
        const out = exitPort(r, c, size);
        if (out) {
          if (!samePort(out, vehicles[v].target)) return;
          if (v + 1 === vehicles.length) {
            if (used === budget && (!best || clicks < best.clicks)) {
              best = {
                fences: used,
                clicks,
                board: Array.from({ length: size }, (_, i) =>
                  Array.from({ length: size }, (_, j) => FENCES[Math.max(0, decided[i * size + j] - 1)])),
              };
            }
            return;
          }
          const next = vehicles[v + 1];
          const [nr, nc] = entryCell(next.entry, size);
          walk(v + 1, nr, nc, entryDir(next.entry), used, clicks);
          return;
        }
        const idx = r * size + c;
        if (decided[idx] === 0) {
          for (let choice = 1; choice <= 3; choice++) {
            const fence = choice > 1;
            const nextUsed = used + (fence ? 1 : 0);
            const nextClicks = clicks + (choice - 1);
            // 이 예산에서 해는 정확히 budget 개를 쓴다(더 적게 쓰는 해는 앞 예산에서 이미 없었다)
            if (nextUsed > budget || (best && nextClicks + (budget - nextUsed) >= best.clicks)) continue;
            decided[idx] = choice;
            const d = reflect(FENCES[choice - 1], dir);
            walk(v, r + d[0], c + d[1], d, nextUsed, nextClicks);
            decided[idx] = 0;
          }
          return;
        }
        dir = reflect(FENCES[decided[idx] - 1], dir);
        r += dir[0];
        c += dir[1];
      }
    };

    const [r0, c0] = entryCell(vehicles[0].entry, size);
    walk(0, r0, c0, entryDir(vehicles[0].entry), 0, 0);
    if (best) return best;
  }
  return null;
}
