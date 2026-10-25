import { GameDefinition } from '@games/types';
import { accuracyOf, averageOf, groupRows } from '@games/stats';
import { GameCodes, GameCodeSlugs } from '@constants/gameCodes';
import { useNumberPressingStore } from './stores/numberPressingStore';
import { NumberPressingGameSetup } from './components/NumberPressingGameSetup';
import { NumberPressingGame } from './components/NumberPressingGame';
import { NumberPressingResultDetail } from './components/NumberPressingResultDetail';
import { NumberPressingResult, NumberPressingResultR2, NumberPressingSetup } from './logic/types';

const isR1 = (r: NumberPressingResult) => 'targetNumber' in r.problem;

const conditionLabel = (r: NumberPressingResultR2) => {
  const { doubleClick, skip } = r.problem;
  if (doubleClick.length > 0 && skip.length > 0) return '두 번 + 건너뛰기';
  if (doubleClick.length > 0) return '두 번 누르기만';
  if (skip.length > 0) return '건너뛰기만';
  return '조건 없음';
};

export const numberPressingGame: GameDefinition<NumberPressingSetup, NumberPressingResult> = {
  code: GameCodes.NUMBER_PRESSING,
  slug: GameCodeSlugs.NUMBER_PRESSING,
  title: '숫자 누르기',
  description: '두 번 누르기·건너뛰기 규칙을 지키며 1부터 9까지 누른다 (인지 제어)',
  useStore: useNumberPressingStore,
  Setup: NumberPressingGameSetup,
  Game: NumberPressingGame,
  ResultDetail: NumberPressingResultDetail,
  selectRecord: (state) => ({
    settings: state.gameState!.setup,
    results: [...state.results.resultsR1, ...state.results.resultsR2],
  }),
  formatSettings: (s) => [
    `실전 모드: ${s.isRealMode ? 'ON' : 'OFF'}`,
    `라운드: ${s.rounds.join(', ')}`,
    `문제 수: ${s.problemsPerRound}개`,
    `시간 제한: R1 ${s.timeLimitR1}초 / R2 ${s.timeLimitR2}초`,
  ],
  metrics: (results) => ({
    accuracy: accuracyOf(results),
    averageTimeMs: averageOf(results, (r) => r.timeTaken * 1000),
    round1Accuracy: accuracyOf(results.filter(isR1)),
    round2Accuracy: accuracyOf(results.filter((r) => !isR1(r))),
  }),
  metricOptions: [
    { value: 'accuracy', label: '정답률 (%)' },
    { value: 'averageTimeMs', label: '평균 소요 시간 (ms)' },
    { value: 'round1Accuracy', label: '1라운드 정답률 (%)' },
    { value: 'round2Accuracy', label: '2라운드 정답률 (%)' },
  ],
  breakdowns: (results) => [
    { title: '라운드별', rows: groupRows(results, (r) => (isR1(r) ? '1라운드' : '2라운드'), (r) => r.timeTaken * 1000, ['1라운드', '2라운드']) },
    {
      title: '2라운드 조건별',
      rows: groupRows(results.filter((r) => !isR1(r)) as NumberPressingResultR2[], conditionLabel, (r) => r.timeTaken * 1000,
        ['두 번 누르기만', '건너뛰기만', '두 번 + 건너뛰기', '조건 없음']),
    },
  ],
};
