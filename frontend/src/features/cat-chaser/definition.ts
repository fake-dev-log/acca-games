import { GameDefinition } from '@games/types';
import { accuracyOf, averageOf, groupRows } from '@games/stats';
import { GameCodes, GameCodeSlugs } from '@constants/gameCodes';
import { useCatChaserStore } from './stores/useCatChaserStore';
import { CatChaserGameSetup } from './components/CatChaserGameSetup';
import { CatChaserGame } from './components/CatChaserGame';
import { CatChaserResultDetail } from './components/CatChaserResultDetail';
import { CatChaserResult, CatChaserSettings } from './logic/types';

export const catChaserGame: GameDefinition<CatChaserSettings, CatChaserResult> = {
  code: GameCodes.CAT_CHASER,
  slug: GameCodeSlugs.CAT_CHASER,
  title: '고양이 술래잡기',
  description: '잠깐 보인 생쥐 위치를 기억해 고양이가 잡았는지 확신도와 함께 답한다 (기억력)',
  useStore: useCatChaserStore,
  Setup: CatChaserGameSetup,
  Game: CatChaserGame,
  ResultDetail: CatChaserResultDetail,
  selectRecord: (state) => ({ settings: state.gameState!.settings, results: state.results }),
  formatSettings: (s) => [
    `실전 모드: ${s.isRealMode ? 'ON' : 'OFF'}`,
    `문제 수: ${s.numTrials}개`,
    `난이도: ${s.difficulty === 'auto' ? '자동 (난이도 증가)' : `${s.difficulty}마리`}`,
    `제시 시간: ${s.showTime}초`,
    `응답 제한 시간: ${s.responseTimeLimit}초`,
  ],
  metrics: (results) => ({
    accuracy: accuracyOf(results),
    averageTimeMs: averageOf(results, (r) => r.responseTimeMs),
    totalScore: results.reduce((sum, r) => sum + r.score, 0),
  }),
  metricOptions: [
    { value: 'accuracy', label: '정답률 (%)' },
    { value: 'totalScore', label: '총점' },
    { value: 'averageTimeMs', label: '평균 응답 시간 (ms)' },
  ],
  breakdowns: (results) => [
    { title: '고양이 색별', rows: groupRows(results, (r) => (r.targetColor === 'RED' ? '빨간 고양이' : '파란 고양이'), (r) => r.responseTimeMs, ['빨간 고양이', '파란 고양이']) },
    {
      title: '확신도별',
      rows: groupRows(results, (r) => (r.playerChoice === 'TIMEOUT' ? '시간 초과' : `확신도 ${r.confidence}`), (r) => r.responseTimeMs,
        ['확신도 1', '확신도 2', '확신도 3', '확신도 4', '시간 초과']),
    },
  ],
};
