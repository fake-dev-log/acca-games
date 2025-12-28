export type Transform = 'rotate_left_45' | 'rotate_right_45' | 'flip_horizontal' | 'flip_vertical';

export interface ShapeRotationSettings {
  round: number;
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
  Solution: string[];
}

export interface ShapeRotationResult {
  sessionId: number;
  problemId: number;
  userSolution: Transform[];
  isCorrect: boolean;
  solveTime: number; // in milliseconds
  clickCount: number;
}
