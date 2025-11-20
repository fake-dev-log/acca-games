import { useCountComparisonStore } from '../stores/countComparisonStore';
import { GameCodeSlugs } from '@constants/gameCodes';
import { GameRecordsDashboard } from '@components/records/GameRecordsDashboard';
import { types } from '@wails/go/models';
import { calculateCommonMetrics } from '@utils/metrics';
import { useMemo } from 'react';
import { getMetricLabel } from '@utils/countComparisonHelpers';

export function CountComparisonRecords() {
  const { paginatedSessions, loading, error, fetchPaginatedSessions } = useCountComparisonStore();
  const calculateSessionMetrics = (session: types.CountComparisonSessionWithResults): { [key: string]: number } => {
    const commonMetrics = calculateCommonMetrics(session.results);

    const trapMetrics: {
      [key: string]: { total: number; correct: number; responseTime: number };
    } = {};

    session.results.forEach((result: types.CountComparisonResult) => {
      let appliedTraps: types.AppliedTrap[] = [];
      try {
        if (result.appliedTraps) {
          const parsedTraps = JSON.parse(result.appliedTraps);
          if (Array.isArray(parsedTraps)) {
            appliedTraps = parsedTraps;
          }
        }
      } catch (e) {
        console.error('Failed to parse applied traps JSON:', e);
      }

      if (appliedTraps.length === 0) {
        const key = 'No Trap';
        if (!trapMetrics[key]) trapMetrics[key] = { total: 0, correct: 0, responseTime: 0 };
        trapMetrics[key].total++;
        if (result.isCorrect) trapMetrics[key].correct++;
        trapMetrics[key].responseTime += result.responseTimeMs;
      } else {
        appliedTraps.forEach((trap) => {
          const key = `${trap.type}_${trap.appliedTo}`; // e.g., "FontSize_left"
          if (!trapMetrics[key]) trapMetrics[key] = { total: 0, correct: 0, responseTime: 0 };
          trapMetrics[key].total++;
          if (result.isCorrect) trapMetrics[key].correct++;
          trapMetrics[key].responseTime += result.responseTimeMs;
        });
      }
    });

    const customMetrics: { [key: string]: number } = {};
    Object.entries(trapMetrics).forEach(([key, metrics]) => {
      customMetrics[`${key} Accuracy`] = metrics.total > 0 ? (metrics.correct / metrics.total) * 100 : 0;
      customMetrics[`${key} Avg Response Time`] = metrics.total > 0 ? metrics.responseTime / metrics.total : 0;
    });

    const finalMetrics: { [key: string]: number } = {};
    const rawMetrics: { [key: string]: number } = {
      ...commonMetrics,
      ...customMetrics,
    };

    for (const key in rawMetrics) {
        if (Object.prototype.hasOwnProperty.call(rawMetrics, key)) {
            const value = rawMetrics[key];
            if (typeof value === 'number') {
                finalMetrics[key] = value;
            } else {
                console.warn(`Metric "${key}" has non-numeric value:`, value);
            }
        }
    }
    return finalMetrics;
  };

  const baseMetricOptions = [
    { value: 'overallAccuracy', label: getMetricLabel('overallAccuracy') },
    { value: 'averageResponseTimeMs', label: getMetricLabel('averageResponseTimeMs') },
  ];

  const metricOptions = useMemo(() => {
    const dynamicOptions: { value: string; label: string }[] = [];
    if (paginatedSessions.sessions.length > 0) {
      const sampleSession = paginatedSessions.sessions[0];
      const sampleMetrics = calculateSessionMetrics(sampleSession);

      Object.keys(sampleMetrics).forEach(key => {
        if (!baseMetricOptions.some(opt => opt.value === key)) {
          dynamicOptions.push({ value: key, label: getMetricLabel(key) });
        }
      });
    }
    return [...baseMetricOptions, ...dynamicOptions];
  }, [paginatedSessions.sessions]);

  return (
    <GameRecordsDashboard
      gameCodeSlug={GameCodeSlugs.COUNT_COMPARISON}
      gameTitle="개수 비교하기 기록"
      useStoreHook={useCountComparisonStore}
      calculateSessionMetrics={calculateSessionMetrics}
      metricOptions={metricOptions}
    />
  );
}
