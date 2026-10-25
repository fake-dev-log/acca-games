import { GameDefinition } from '@games/types';
import { groupRows } from '@games/stats';
import { GameCodes, GameCodeSlugs } from '@constants/gameCodes';
import { usePathStore } from './stores/pathStore';
import { PathGameSetup } from './components/PathGameSetup';
import { PathGame } from './components/PathGame';
import { PathResultDetail } from './components/PathResultDetail';
import { calculatePathStats } from './logic/stats';
import { PathResult, PathSettings } from './logic/types';

export const pathGame: GameDefinition<PathSettings, PathResult> = {
  code: GameCodes.PATH,
  slug: GameCodeSlugs.PATH,
  title: '길 만들기',
  description: '대각선 울타리를 최소로 놓아 모든 차를 같은 색 손님에게 보낸다 (계획능력)',
  useStore: usePathStore,
  Setup: PathGameSetup,
  Game: PathGame,
  ResultDetail: PathResultDetail,
  selectRecord: (state) => ({ settings: state.gameState!.settings, results: state.results }),
  formatSettings: (s) => [
    `실전 모드: ${s.isRealMode ? 'ON' : 'OFF'}`,
    `라운드: ${s.rounds.join(', ')}`,
    `제한 시간: 라운드마다 ${s.timeLimitSec}초`,
  ],
  metrics: (results) => {
    const stats = calculatePathStats(results);
    return {
      accuracy: stats.accuracy,
      solvedCount: stats.solvedCount,
      optimalRate: stats.optimalRate,
      averageExtraClicks: stats.averageExtraClicks,
      averageTimeMs: stats.averageSolveTimeMs,
    };
  },
  metricOptions: [
    { value: 'accuracy', label: '해결률 (%)' },
    { value: 'solvedCount', label: '해결한 문제 수' },
    { value: 'optimalRate', label: '최소 울타리 해결 비율 (%)' },
    { value: 'averageExtraClicks', label: '평균 초과 클릭' },
    { value: 'averageTimeMs', label: '평균 해결 시간 (ms)' },
  ],
  breakdowns: (results) => [
    { title: '라운드별', rows: groupRows(results, (r) => `${r.round}라운드 (${r.puzzle.size}×${r.puzzle.size})`, (r) => r.timeMs) },
    { title: '최소 울타리 수별', rows: groupRows([...results].sort((a, b) => a.puzzle.minFences - b.puzzle.minFences), (r) => `${r.puzzle.minFences}개`, (r) => r.timeMs) },
  ],
};
