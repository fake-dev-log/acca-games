import { accuracyOf, averageOf } from '@games/stats';
import { PathResult } from './types';

export const isOptimal = (r: PathResult) => r.isCorrect && r.fencesUsed === r.puzzle.minFences;

export function calculatePathStats(results: PathResult[]) {
  const solved = results.filter((r) => r.isCorrect);
  return {
    solvedCount: solved.length,
    accuracy: accuracyOf(results), // 푼 문제 비율
    optimalRate: solved.length ? (solved.filter(isOptimal).length / solved.length) * 100 : 0, // 푼 문제 중 최소 울타리
    averageExtraClicks: averageOf(solved, (r) => r.clicks - r.puzzle.minClicks),
    averageSolveTimeMs: averageOf(solved, (r) => r.timeMs),
  };
}
