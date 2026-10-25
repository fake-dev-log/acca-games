import { GameDefinition } from '@games/types';
import { accuracyOf, averageOf, groupRows } from '@games/stats';
import { GameCodes, GameCodeSlugs } from '@constants/gameCodes';
import { useRpsStore } from './stores/rpsStore';
import { RpsGameSetup } from './components/RpsGameSetup';
import { RpsGame } from './components/RpsGame';
import { RpsResultDetail } from './components/RpsResultDetail';
import { RpsResult, RpsSettings } from './logic/types';

const ROUND_LABELS: Record<number, string> = { 1: '1라운드 (나 = ?)', 2: '2라운드 (상대 = ?)', 3: '3라운드 (무작위)' };

export const rpsGame: GameDefinition<RpsSettings, RpsResult> = {
  code: GameCodes.RPS,
  slug: GameCodeSlugs.RPS,
  title: '가위바위보',
  description: '물음표 위치에 따라 이기는 패·지는 패를 고른다 (인지 전환)',
  useStore: useRpsStore,
  Setup: RpsGameSetup,
  Game: RpsGame,
  ResultDetail: RpsResultDetail,
  selectRecord: (state) => ({ settings: state.gameState!.settings, results: state.results }),
  formatSettings: (s) => [
    `실전 모드: ${s.isRealMode ? 'ON' : 'OFF'}`,
    `라운드: ${s.rounds.join(', ')}`,
    `문제 수: ${s.questionsPerRound}개/라운드`,
    `시간 제한: ${s.timeLimitMs / 1000}초`,
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
    { title: '라운드별', rows: groupRows(results, (r) => ROUND_LABELS[r.round] ?? `${r.round}라운드`, (r) => r.responseTimeMs, Object.values(ROUND_LABELS)) },
    { title: '물음표 위치별', rows: groupRows(results, (r) => (r.problemCardHolder === 'me' ? '나 (이기는 패)' : '상대 (지는 패)'), (r) => r.responseTimeMs) },
  ],
};
