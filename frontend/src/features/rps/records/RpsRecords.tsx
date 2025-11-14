import { useRpsStore } from '../stores/rpsStore';
import { GameCodeSlugs } from '@constants/gameCodes';
import { GameRecordsDashboard } from '@components/records/GameRecordsDashboard';
import { types } from '@wails/go/models';

export function RpsRecords() {
  const calculateSessionMetrics = (session: types.RpsSessionWithResults) => {
    const totalResults = session.results.length;
    const correctCount = session.results.filter(r => r.isCorrect).length;
    const totalResponseTime = session.results.reduce((sum, r) => sum + r.responseTimeMs, 0);

    const overallAccuracy = totalResults > 0 ? (correctCount / totalResults) * 100 : 0;
    const averageResponseTimeMs = totalResults > 0 ? totalResponseTime / totalResults : 0;

    return {
      overallAccuracy: overallAccuracy,
      averageResponseTimeMs: averageResponseTimeMs,
    };
  };

  const metricOptions = [
    { value: 'overallAccuracy', label: '전체 정확도 (%)' },
    { value: 'averageResponseTimeMs', label: '평균 반응 시간 (ms)' },
  ];

  return (
    <GameRecordsDashboard
      gameCodeSlug={GameCodeSlugs.RPS}
      gameTitle="가위바위보 게임 기록"
      useStoreHook={useRpsStore}
      calculateSessionMetrics={calculateSessionMetrics}
      metricOptions={metricOptions}
    />
  );
}
