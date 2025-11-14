import useShapeRotationStore from '../stores/shapeRotationStore';
import { GameCodeSlugs } from '@constants/gameCodes';
import { GameRecordsDashboard } from '@components/records/GameRecordsDashboard';
import { types } from '@wails/go/models';

export function ShapeRotationRecords() {
  const calculateSessionMetrics = (session: types.ShapeRotationSessionWithResults) => {
    const totalResults = session.results.length;
    const correctCount = session.results.filter(r => r.isCorrect).length;
    const totalSolveTime = session.results.reduce((sum, r) => sum + r.solveTime, 0);
    const totalClickCount = session.results.reduce((sum, r) => sum + r.clickCount, 0);

    const overallAccuracy = totalResults > 0 ? (correctCount / totalResults) * 100 : 0;
    const averageSolveTimeMs = totalResults > 0 ? totalSolveTime / totalResults : 0;
    const averageClickCount = totalResults > 0 ? totalClickCount / totalResults : 0;

    return {
      overallAccuracy: overallAccuracy,
      averageSolveTimeMs: averageSolveTimeMs,
      averageClickCount: averageClickCount,
    };
  };

  const metricOptions = [
    { value: 'overallAccuracy', label: '전체 정확도 (%)' },
    { value: 'averageSolveTimeMs', label: '평균 풀이 시간 (ms)' },
    { value: 'averageClickCount', label: '평균 클릭 수' },
  ];

  return (
    <GameRecordsDashboard
      gameCodeSlug={GameCodeSlugs.SHAPE_ROTATION}
      gameTitle="도형 회전하기 게임 기록"
      useStoreHook={useShapeRotationStore}
      calculateSessionMetrics={calculateSessionMetrics}
      metricOptions={metricOptions}
    />
  );
}
