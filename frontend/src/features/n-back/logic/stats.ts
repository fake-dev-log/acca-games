import { NBackResult } from './types';

export interface NBackStats {
  totalQuestions: number;
  totalCorrect: number;
  accuracy: number;
  averageResponseTimeMs: number;
}

export function calculateNBackStats(results: NBackResult[]): NBackStats {
  const totalQuestions = results.length;
  if (totalQuestions === 0) {
    return {
      totalQuestions: 0,
      totalCorrect: 0,
      accuracy: 0,
      averageResponseTimeMs: 0,
    };
  }

  const totalCorrect = results.filter(r => r.isCorrect).length;
  const totalResponseTime = results.reduce((acc, r) => acc + r.responseTimeMs, 0);

  return {
    totalQuestions,
    totalCorrect,
    accuracy: (totalCorrect / totalQuestions) * 100,
    averageResponseTimeMs: totalResponseTime / totalQuestions,
  };
}
