export type Fence = '/' | '\\';
export type Cell = Fence | null;
export type Side = 'top' | 'bottom' | 'left' | 'right';

// 판 바깥 가장자리 자리. index 는 top·bottom 이면 열, left·right 면 행.
export interface Port {
  side: Side;
  index: number;
}

export interface Vehicle {
  color: string;
  entry: Port; // 교통수단이 있는 자리 — 판 안쪽으로 출발한다
  target: Port; // 같은 색 손님이 있는 자리
}

export interface PathPuzzle {
  size: number;
  vehicles: Vehicle[];
  minFences: number;
  minClicks: number; // 최소 울타리로 풀 때의 최소 클릭 수('/' 1번, '\' 2번)
  solution: Cell[][]; // 최소 해 하나
}

export interface PathSettings {
  rounds: number[];
  timeLimitSec: number; // 라운드마다
  isRealMode: boolean;
}

export interface PathResult {
  sessionId: number;
  round: number;
  problemNum: number; // 전체 연번, 1부터
  puzzle: PathPuzzle;
  board: Cell[][]; // 마지막으로 놓여 있던 울타리
  isCorrect: boolean; // 모든 교통수단이 손님에게 도착
  fencesUsed: number;
  clicks: number;
  attempts: number; // '출발' 누른 횟수
  timeMs: number;
  revealed: boolean; // 연습 모드에서 정답을 본 문제
}
