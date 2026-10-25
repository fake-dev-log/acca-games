import { NumberPressingResult, NumberPressingResultR1, NumberPressingResultR2 } from './types';

export interface NumberPressingStats {
  totalQuestions: number;
  totalCorrect: number;
  accuracy: number;
  averageTimeTaken: number;
  roundStats: {
    round: number;
    totalQuestions: number;
    totalCorrect: number;
    accuracy: number;
    averageTimeTaken: number;
  }[];
}

function isResultR1(result: NumberPressingResult): result is NumberPressingResultR1 {
  return 'targetNumber' in result.problem;
}

export function calculateNumberPressingStats(results: NumberPressingResult[]): NumberPressingStats {
  const r1 = results.filter(isResultR1);
  const r2 = results.filter(r => !isResultR1(r)) as NumberPressingResultR2[];
  
  const totalQuestions = results.length;

  if (totalQuestions === 0) {
    return {
      totalQuestions: 0,
      totalCorrect: 0,
      accuracy: 0,
      averageTimeTaken: 0,
      roundStats: [],
    };
  }

  const r1Correct = r1.filter(r => r.isCorrect).length;
  const r2Correct = r2.filter(r => r.isCorrect).length;
  const totalCorrect = r1Correct + r2Correct;

  const r1Time = r1.reduce((acc, r) => acc + r.timeTaken, 0);
  const r2Time = r2.reduce((acc, r) => acc + r.timeTaken, 0);
  const totalTime = r1Time + r2Time;

  const roundStats = [];

  if (r1.length > 0) {
    roundStats.push({
      round: 1,
      totalQuestions: r1.length,
      totalCorrect: r1Correct,
      accuracy: (r1Correct / r1.length) * 100,
      averageTimeTaken: r1Time / r1.length,
    });
  }

  if (r2.length > 0) {
    roundStats.push({
      round: 2,
      totalQuestions: r2.length,
      totalCorrect: r2Correct,
      accuracy: (r2Correct / r2.length) * 100,
      averageTimeTaken: r2Time / r2.length,
    });
  }

  return {
    totalQuestions,
    totalCorrect,
    accuracy: (totalCorrect / totalQuestions) * 100,
    averageTimeTaken: totalTime / totalQuestions,
    roundStats,
  };
}