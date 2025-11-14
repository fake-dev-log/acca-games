import { useNumberPressingStore } from '../stores/numberPressingStore';
import { GameCodeSlugs } from '@constants/gameCodes';
import { GameRecordsDashboard } from '@components/records/GameRecordsDashboard';
import { types } from '@wails/go/models';

export function NumberPressingRecords() {
  const calculateSessionMetrics = (session: types.NumberPressingSessionWithResults) => {
    const totalResultsR1 = session.results.resultsR1.length;
    const correctCountR1 = session.results.resultsR1.filter(r => r.isCorrect).length;
    const totalTimeR1 = session.results.resultsR1.reduce((sum, r) => sum + r.timeTaken, 0);

    const totalResultsR2 = session.results.resultsR2.length;
    const correctCountR2 = session.results.resultsR2.filter(r => r.isCorrect).length;
    const totalTimeR2 = session.results.resultsR2.reduce((sum, r) => sum + r.timeTaken, 0);

    const totalResults = totalResultsR1 + totalResultsR2;
    const correctCount = correctCountR1 + correctCountR2;
    const totalTime = totalTimeR1 + totalTimeR2;

    const overallAccuracy = totalResults > 0 ? (correctCount / totalResults) * 100 : 0;
    const averageTimeTakenSec = totalResults > 0 ? totalTime / totalResults : 0;

    const round1Accuracy = totalResultsR1 > 0 ? (correctCountR1 / totalResultsR1) * 100 : 0;
    const round1AverageTimeTakenSec = totalResultsR1 > 0 ? totalTimeR1 / totalResultsR1 : 0;

    const round2Accuracy = totalResultsR2 > 0 ? (correctCountR2 / totalResultsR2) * 100 : 0;
    const round2AverageTimeTakenSec = totalResultsR2 > 0 ? totalTimeR2 / totalResultsR2 : 0;

    return {
      overallAccuracy: overallAccuracy,
      averageTimeTakenSec: averageTimeTakenSec,
      round1Accuracy: round1Accuracy,
      round1AverageTimeTakenSec: round1AverageTimeTakenSec,
      round2Accuracy: round2Accuracy,
      round2AverageTimeTakenSec: round2AverageTimeTakenSec,
    };
  };

  const metricOptions = [
    { value: 'overallAccuracy', label: '전체 정확도 (%)' },
    { value: 'averageTimeTakenSec', label: '평균 시간 (초)' },
    { value: 'round1Accuracy', label: '1라운드 정확도 (%)' },
    { value: 'round1AverageTimeTakenSec', label: '1라운드 평균 시간 (초)' },
    { value: 'round2Accuracy', label: '2라운드 정확도 (%)' },
    { value: 'round2AverageTimeTakenSec', label: '2라운드 평균 시간 (초)' },
  ];

  return (
    <GameRecordsDashboard
      gameCodeSlug={GameCodeSlugs.NUMBER_PRESSING}
      gameTitle="숫자 누르기 게임 기록"
      useStoreHook={useNumberPressingStore}
      calculateSessionMetrics={calculateSessionMetrics}
      metricOptions={metricOptions}
    />
  );
}
