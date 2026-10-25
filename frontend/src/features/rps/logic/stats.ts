import { RpsResult } from './types';

export interface RpsStats {
  totalQuestions: number;
  totalCorrect: number;
  accuracy: number;
  averageResponseTimeMs: number;
  roundStats: {
    round: number;
    totalQuestions: number;
    totalCorrect: number;
    accuracy: number;
    averageResponseTimeMs: number;
  }[];
}

export function calculateRpsStats(results: RpsResult[]): RpsStats {
  const totalQuestions = results.length;
  if (totalQuestions === 0) {
    return {
      totalQuestions: 0,
      totalCorrect: 0,
      accuracy: 0,
      averageResponseTimeMs: 0,
      roundStats: [],
    };
  }

  const totalCorrect = results.filter(r => r.isCorrect).length;
  const totalResponseTime = results.reduce((acc, r) => acc + r.responseTimeMs, 0);

  const roundMap = new Map<number, RpsResult[]>();
  results.forEach(r => {
    const roundResults = roundMap.get(r.round) || [];
    roundResults.push(r);
    roundMap.set(r.round, roundResults);
  });

  const roundStats = Array.from(roundMap.entries())
    .map(([round, roundResults]) => {
      const qCount = roundResults.length;
      const cCount = roundResults.filter(r => r.isCorrect).length;
      const rTime = roundResults.reduce((acc, r) => acc + r.responseTimeMs, 0);

      return {
        round,
        totalQuestions: qCount,
        totalCorrect: cCount,
        accuracy: (cCount / qCount) * 100,
        averageResponseTimeMs: rTime / qCount,
      };
    })
    .sort((a, b) => a.round - b.round);

  return {
    totalQuestions,
    totalCorrect,
    accuracy: (totalCorrect / totalQuestions) * 100,
    averageResponseTimeMs: totalResponseTime / totalQuestions,
    roundStats,
  };
}
