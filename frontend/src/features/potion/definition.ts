import { GameDefinition } from '@games/types';
import { averageOf, groupRows } from '@games/stats';
import { GameCodes, GameCodeSlugs } from '@constants/gameCodes';
import { usePotionStore } from './stores/potionStore';
import { PotionGameSetup } from './components/PotionGameSetup';
import { PotionGame } from './components/PotionGame';
import { PotionResultDetail } from './components/PotionResultDetail';
import { calculatePotionStats } from './logic/stats';
import { PotionResult, PotionSettings } from './logic/types';

const stageLabel = (r: PotionResult) =>
  r.phase === 'before' ? '레시피 변경 전' : r.changedCombo ? '변경 후 · 바뀐 조합' : '변경 후 · 안 바뀐 조합';

export const potionGame: GameDefinition<PotionSettings, PotionResult> = {
  code: GameCodes.POTION,
  slug: GameCodeSlugs.POTION,
  title: '마법약 만들기',
  description: '재료 조합마다 잘 나오는 약을 결과로 익히고, 중간에 바뀌는 레시피에 적응한다 (학습능력)',
  useStore: usePotionStore,
  Setup: PotionGameSetup,
  Game: PotionGame,
  ResultDetail: PotionResultDetail,
  selectRecord: (state) => ({ settings: state.gameState!.settings, results: state.results }),
  formatSettings: (s) => [
    `문제 수: ${s.numTrials}개`,
    `응답 제한 시간: ${s.responseTimeLimitMs / 1000}초`,
    `우세 색 확률: ${Math.round(s.dominantProbability * 100)}%`,
    `레시피 변경: ${s.recipeChange ? 'ON' : 'OFF'}`,
  ],
  // 정답률은 채점 문제만으로 낸다
  metrics: (results) => {
    const stats = calculatePotionStats(results);
    return {
      accuracy: stats.accuracy,
      averageTimeMs: averageOf(results, (r) => r.responseTimeMs),
      beforeAccuracy: stats.beforeAccuracy,
      afterChangedAccuracy: stats.afterChangedAccuracy,
      afterUnchangedAccuracy: stats.afterUnchangedAccuracy,
    };
  },
  metricOptions: [
    { value: 'accuracy', label: '정답률 (%, 채점 문제)' },
    { value: 'beforeAccuracy', label: '레시피 변경 전 정답률 (%)' },
    { value: 'afterChangedAccuracy', label: '변경 후 바뀐 조합 정답률 (%)' },
    { value: 'afterUnchangedAccuracy', label: '변경 후 안 바뀐 조합 정답률 (%)' },
    { value: 'averageTimeMs', label: '평균 응답 시간 (ms)' },
  ],
  breakdowns: (results) => {
    const scored = results.filter((r) => r.scored);
    return [
      { title: '단계별 (채점 문제)', rows: groupRows(scored, stageLabel, (r) => r.responseTimeMs, ['레시피 변경 전', '변경 후 · 바뀐 조합', '변경 후 · 안 바뀐 조합']) },
      { title: '공개 카드 수별 (채점 문제)', rows: groupRows(scored, (r) => `${r.combo.length}장`, (r) => r.responseTimeMs, ['1장', '2장', '3장']) },
    ];
  },
};
