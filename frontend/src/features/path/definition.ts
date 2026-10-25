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
  description: '대각선 울타리를 최소로 놓아 모든 교통수단을 짝 손님에게 보낸다 (계획능력)',
  useStore: usePathStore,
  Setup: PathGameSetup,
  Game: PathGame,
  ResultDetail: PathResultDetail,
  selectRecord: (state) => ({ settings: state.gameState!.settings, results: state.results }),
  formatSettings: (s) => [
    `실전 모드: ${s.isRealMode ? 'ON' : 'OFF'}`,
    `난이도: ${s.difficulty === 'hard' ? '어려움(벽)' : '보통'}`,
    `제한 시간: ${s.timeLimitSec ? `${Math.floor(s.timeLimitSec / 60)}분${s.timeLimitSec % 60 ? ` ${s.timeLimitSec % 60}초` : ''}` : '무제한'}`,
    `문제 수: ${s.problemCount}개`,
  ],
  metrics: (results) => {
    const stats = calculatePathStats(results);
    return {
      accuracy: stats.accuracy,
      solvedCount: stats.solvedCount,
      perfectCount: stats.perfectCount,
      averageExcess: stats.averageExcess,
      averageTimeMs: stats.averageSolveTimeMs,
    };
  },
  metricOptions: [
    { value: 'accuracy', label: '해결률 (%)' },
    { value: 'solvedCount', label: '해결한 문제 수' },
    { value: 'perfectCount', label: '완벽하게 푼 문제 수' },
    { value: 'averageExcess', label: '평균 초과 설치 (개)' },
    { value: 'averageTimeMs', label: '평균 해결 시간 (ms)' },
  ],
  breakdowns: (results) => [
    { title: '교통수단 수별', rows: groupRows([...results].sort((a, b) => a.puzzle.vehicles.length - b.puzzle.vehicles.length), (r) => `${r.puzzle.vehicles.length}대`, (r) => r.timeMs) },
    { title: '정답 울타리 수별', rows: groupRows([...results].sort((a, b) => a.puzzle.minFences - b.puzzle.minFences), (r) => `${r.puzzle.minFences}개`, (r) => r.timeMs) },
  ],
};
