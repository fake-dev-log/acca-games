interface Result {
  isCorrect: boolean;
  responseTimeMs: number;
}

export const calculateCommonMetrics = (results: Result[]) => {
  const totalResults = results.length;
  if (totalResults === 0) {
    return {
      overallAccuracy: 0,
      averageResponseTimeMs: 0,
    };
  }

  const correctCount = results.filter(r => r.isCorrect).length;
  const totalResponseTime = results.reduce((sum, r) => sum + r.responseTimeMs, 0);

  const overallAccuracy = (correctCount / totalResults) * 100;
  const averageResponseTimeMs = totalResponseTime / totalResults;

  return {
    overallAccuracy,
    averageResponseTimeMs,
  };
};
