export type Fence = '/' | '\\';
export type Cell = Fence | null;
export type Side = 'top' | 'bottom' | 'left' | 'right';
export type VehicleKind = 'taxi' | 'bus' | 'bike';

// 판 바깥 가장자리 자리. index 는 top·bottom 이면 열, left·right 면 행.
export interface Port {
  side: Side;
  index: number;
}

export interface Vehicle {
  kind: VehicleKind; // 택시 → 1인 손님 · 버스 → 단체 손님 · 오토바이 → 화물 손님
  entry: Port; // 교통수단이 있는 자리 — 판 안쪽으로 출발한다
  target: Port; // 짝이 되는 손님이 있는 자리
}

export interface PathPuzzle {
  size: number;
  walls: boolean[][]; // 벽 칸 — 지나갈 수 없고 울타리도 못 놓는다
  vehicles: Vehicle[];
  minFences: number;
  solution: Cell[][]; // 최소 해 하나
}

export type PathDifficulty = 'normal' | 'hard';

export interface PathSettings {
  isRealMode: boolean; // 실전: 정답 비공개
  difficulty: PathDifficulty; // 보통 = 실제와 비슷(갈수록 어려워짐) · 어려움 = 벽 많은 고난도만
  timeLimitSec: number; // 0 = 무제한
  problemCount: number;
}

export type PathVerdict = 'perfect' | 'excess' | 'wrong'; // 최소 울타리로 해결 · 더 많이 놓고 해결 · 못 감

export interface PathResult {
  sessionId: number;
  problemNum: number; // 1부터
  puzzle: PathPuzzle;
  board: Cell[][]; // 제출한(또는 시간이 끝났을 때의) 울타리
  isCorrect: boolean; // 모든 교통수단이 짝 손님에게 도착
  verdict: PathVerdict;
  fencesUsed: number;
  excessFences: number; // 해결했을 때 최소보다 더 놓은 개수
  clicks: number;
  timeMs: number;
}
