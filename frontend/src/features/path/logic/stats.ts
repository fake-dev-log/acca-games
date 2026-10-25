import { accuracyOf, averageOf } from '@games/stats';
import { PathResult } from './types';

export function calculatePathStats(results: PathResult[]) {
  const solved = results.filter((r) => r.isCorrect);
  return {
    solvedCount: solved.length,
    perfectCount: results.filter((r) => r.verdict === 'perfect').length,
    accuracy: accuracyOf(results), // 푼 문제 비율
    averageExcess: averageOf(solved, (r) => r.excessFences), // 해결한 문제의 평균 초과 설치
    averageSolveTimeMs: averageOf(solved, (r) => r.timeMs),
  };
}
