export type Transform = 'rotate_left_45' | 'rotate_right_45' | 'flip_horizontal' | 'flip_vertical';

export interface ShapeRotationSettings {
  round: number; // 1 = 알파벳, 2 = 격자, 0 = 두 라운드 모두(라운드마다 numProblems 개)
  numProblems: number;
  timeLimit: number; // in seconds
  isRealMode: boolean;
}

export interface ShapeRotationProblem {
  ID: number;
  Round: number;
  InitialShape: string;
  FinalShape: string;
  InitialGridPath?: string;
  FinalGridPath?: string;
  InitialShapeCenterX: number;
  InitialShapeCenterY: number;
  FinalShapeCenterX: number;
  FinalShapeCenterY: number;
  MinMoves: number;
  Solution: Transform[]; // 최소 해 중 하나
}

export interface ShapeRotationResult {
  sessionId: number;
  problem: ShapeRotationProblem; // 기록에서 오답 문제를 다시 그리기 위한 스냅샷
  userSolution: Transform[];
  isCorrect: boolean;
  solveTime: number; // in milliseconds
  clickCount: number;
}
