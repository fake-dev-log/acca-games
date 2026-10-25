import { GameDefinition } from '@games/types';
import { accuracyOf, averageOf, groupRows } from '@games/stats';
import { GameCodes, GameCodeSlugs } from '@constants/gameCodes';
import { useNBackStore } from './stores/nbackStore';
import { NBackGameSetup } from './components/NBackGameSetup';
import { NBackGame } from './components/NBackGame';
import { NBackResultDetail } from './components/NBackResultDetail';
import { NBackResult, NBackSettings } from './logic/types';

const TARGET_LABELS: Record<string, string> = {
  LEFT: '2번째 전과 같음 (←)',
  RIGHT: '3번째 전과 같음 (→)',
  SPACE: '같지 않음 (Space)',
};

export const nBackGame: GameDefinition<NBackSettings, NBackResult> = {
  code: GameCodes.N_BACK,
  slug: GameCodeSlugs.N_BACK,
  title: '도형 순서 기억하기',
  description: '지금 도형이 2·3번째 전 도형과 같은지 판단한다 (작업기억)',
  useStore: useNBackStore,
  Setup: NBackGameSetup,
  Game: NBackGame,
  ResultDetail: NBackResultDetail,
  selectRecord: (state) => ({ settings: state.gameState!.settings, results: state.results }),
  formatSettings: (s) => [
    `실전 모드: ${s.isRealMode ? 'ON' : 'OFF'}`,
    `N-Back 레벨: ${s.nBackLevel === 1 ? '2-back' : '2 & 3-back'}`,
    `문제 수: ${s.numTrials}개`,
    `제시 시간: ${s.presentationTime / 1000}초`,
    `도형: ${s.shapeGroup === 'random' ? '랜덤' : `${(s.shapeGroup || '').replace('group', '')}번 세트`}`,
  ],
  metrics: (results) => ({
    accuracy: accuracyOf(results),
    averageTimeMs: averageOf(results, (r) => r.responseTimeMs),
  }),
  metricOptions: [
    { value: 'accuracy', label: '정답률 (%)' },
    { value: 'averageTimeMs', label: '평균 반응 시간 (ms)' },
  ],
  breakdowns: (results) => [
    { title: '정답 유형별', rows: groupRows(results, (r) => TARGET_LABELS[r.correctChoice] ?? r.correctChoice, (r) => r.responseTimeMs, Object.values(TARGET_LABELS)) },
  ],
};
