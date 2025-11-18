import { useRpsStore } from '../stores/rpsStore';
import { GameCodeSlugs } from '@constants/gameCodes';
import { GameRecordsDashboard } from '@components/records/GameRecordsDashboard';
import { types } from '@wails/go/models';
import { calculateCommonMetrics } from '@utils/metrics';

export function RpsRecords() {
  const calculateSessionMetrics = (session: types.RpsSessionWithResults) => {
    return calculateCommonMetrics(session.results);
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
