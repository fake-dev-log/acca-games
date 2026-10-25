import { GameDefinition } from '@games/types';
import { accuracyOf, averageOf, groupRows } from '@games/stats';
import { GameCodes, GameCodeSlugs } from '@constants/gameCodes';
import { useCountComparisonStore } from './stores/countComparisonStore';
import CountComparisonGameSetup from './components/CountComparisonGameSetup';
import CountComparisonGame from './components/CountComparisonGame';
import { CountComparisonResultDetail } from './components/CountComparisonResultDetail';
import { CountComparisonResult, CountComparisonSettings } from './logic/types';
import { NO_TRAP_LABEL, formatTrap } from './logic/traps';

export const countComparisonGame: GameDefinition<CountComparisonSettings, CountComparisonResult> = {
  code: GameCodes.COUNT_COMPARISON,
  slug: GameCodeSlugs.COUNT_COMPARISON,
  title: '개수 비교하기',
  description: '잠깐 보이는 두 단어 무리 중 개수가 많은 쪽을 고른다 (판단력)',
  useStore: useCountComparisonStore,
  Setup: CountComparisonGameSetup,
  Game: CountComparisonGame,
  ResultDetail: CountComparisonResultDetail,
  selectRecord: (state) => ({ settings: state.settings, results: state.results }),
  formatSettings: (s) => [
    `실전 모드: ${s.isRealMode ? 'ON' : 'OFF'}`,
    `문제 수: ${s.numProblems}개`,
    `제시 시간: ${s.presentationTime / 1000}초`,
    `입력 시간: ${s.inputTime / 1000}초`,
  ],
  metrics: (results) => ({
    accuracy: accuracyOf(results),
    averageTimeMs: averageOf(results, (r) => r.responseTimeMs),
    noTrapAccuracy: accuracyOf(results.filter((r) => r.appliedTraps.length === 0)),
    trapAccuracy: accuracyOf(results.filter((r) => r.appliedTraps.length > 0)),
  }),
  metricOptions: [
    { value: 'accuracy', label: '정답률 (%)' },
    { value: 'averageTimeMs', label: '평균 반응 시간 (ms)' },
    { value: 'noTrapAccuracy', label: '함정 없는 문제 정답률 (%)' },
    { value: 'trapAccuracy', label: '함정 있는 문제 정답률 (%)' },
  ],
  // 함정이 여러 개 걸린 문제는 각 함정 줄에 한 번씩 센다
  breakdowns: (results) => {
    const perTrap = results.flatMap((r) =>
      r.appliedTraps.length === 0 ? [{ ...r, label: NO_TRAP_LABEL }] : r.appliedTraps.map((t) => ({ ...r, label: formatTrap(t) })));
    return [{ title: '함정별', rows: groupRows(perTrap, (r) => r.label, (r) => r.responseTimeMs) }];
  },
};
