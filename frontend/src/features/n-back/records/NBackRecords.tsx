import { useNBackStore } from '../stores/nbackStore';
import { GameCodeSlugs } from '@constants/gameCodes';
import { GameRecordsDashboard } from '@components/records/GameRecordsDashboard';
import { types } from '@wails/go/models';
import { calculateCommonMetrics } from '@utils/metrics';

export function NBackRecords() {
  const calculateSessionMetrics = (session: types.NBackSessionWithResults) => {
    const commonMetrics = calculateCommonMetrics(session.results);

    const round1Results = session.results.filter(r => r.round === 1);
    const round1Correct = round1Results.filter(r => r.isCorrect).length;
    const round1TotalResponseTime = round1Results.reduce((sum, r) => sum + r.responseTimeMs, 0);
    const round1Accuracy = round1Results.length > 0 ? (round1Correct / round1Results.length) * 100 : 0;
    const round1AverageResponseTimeMs = round1Results.length > 0 ? round1TotalResponseTime / round1Results.length : 0;

    const round2Results = session.results.filter(r => r.round === 2);
    const round2Correct = round2Results.filter(r => r.isCorrect).length;
    const round2TotalResponseTime = round2Results.reduce((sum, r) => sum + r.responseTimeMs, 0);
    const round2Accuracy = round2Results.length > 0 ? (round2Correct / round2Results.length) * 100 : 0;
    const round2AverageResponseTimeMs = round2Results.length > 0 ? round2TotalResponseTime / round2Results.length : 0;

    return {
      ...commonMetrics,
      round1Accuracy: round1Accuracy,
      round1AverageResponseTimeMs: round1AverageResponseTimeMs,
      round2Accuracy: round2Accuracy,
      round2AverageResponseTimeMs: round2AverageResponseTimeMs,
    };
  };

  const metricOptions = [
    { value: 'overallAccuracy', label: '전체 정확도 (%)' },
    { value: 'averageResponseTimeMs', label: '평균 반응 시간 (ms)' },
    { value: 'round1Accuracy', label: '1라운드 정확도 (%)' },
    { value: 'round1AverageResponseTimeMs', label: '1라운드 평균 반응 시간 (ms)' },
    { value: 'round2Accuracy', label: '2라운드 정확도 (%)' },
    { value: 'round2AverageResponseTimeMs', label: '2라운드 평균 반응 시간 (ms)' },
  ];

  return (
    <GameRecordsDashboard
      gameCodeSlug={GameCodeSlugs.N_BACK}
      gameTitle="N-Back 게임 기록"
      useStoreHook={useNBackStore}
      calculateSessionMetrics={calculateSessionMetrics}
      metricOptions={metricOptions}
    />
  );
}
