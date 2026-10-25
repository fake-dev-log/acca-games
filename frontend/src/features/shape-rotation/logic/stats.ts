import { ShapeRotationResult } from './types';

export interface ShapeRotationStats {
  totalQuestions: number;
  totalCorrect: number;
  accuracy: number;
  averageSolveTimeMs: number;
  averageClickCount: number;
}

export function calculateShapeRotationStats(results: ShapeRotationResult[]): ShapeRotationStats {
  const totalQuestions = results.length;
  if (totalQuestions === 0) {
    return {
      totalQuestions: 0,
      totalCorrect: 0,
      accuracy: 0,
      averageSolveTimeMs: 0,
      averageClickCount: 0,
    };
  }

  const totalCorrect = results.filter(r => r.isCorrect).length;
  const totalSolveTime = results.reduce((acc, r) => acc + r.solveTime, 0);
  const totalClickCount = results.reduce((acc, r) => acc + r.clickCount, 0);

  return {
    totalQuestions,
    totalCorrect,
    accuracy: (totalCorrect / totalQuestions) * 100,
    averageSolveTimeMs: totalSolveTime / totalQuestions,
    averageClickCount: totalClickCount / totalQuestions,
  };
}
