import { GameDefinition } from '@games/types';
import { accuracyOf, averageOf, groupRows } from '@games/stats';
import { GameCodes, GameCodeSlugs } from '@constants/gameCodes';
import useShapeRotationStore from './stores/shapeRotationStore';
import ShapeRotationGameSetup from './components/ShapeRotationGameSetup';
import ShapeRotationGame from './components/ShapeRotationGame';
import { ShapeRotationResultDetail } from './components/ShapeRotationResultDetail';
import { ShapeRotationResult, ShapeRotationSettings } from './logic/types';

const ROUND_TEXT: Record<number, string> = { 0: '알파벳 + 격자', 1: '알파벳', 2: '격자' };

export const shapeRotationGame: GameDefinition<ShapeRotationSettings, ShapeRotationResult> = {
  code: GameCodes.SHAPE_ROTATION,
  slug: GameCodeSlugs.SHAPE_ROTATION,
  title: '도형 회전하기',
  description: '회전·반전을 최소 횟수로 조합해 \'전\'을 \'후\'로 만든다 (공간 능력)',
  useStore: useShapeRotationStore,
  Setup: ShapeRotationGameSetup,
  Game: ShapeRotationGame,
  ResultDetail: ShapeRotationResultDetail,
  selectRecord: (state) => ({ settings: state.settings, results: state.results }),
  formatSettings: (s) => [
    `실전 모드: ${s.isRealMode ? 'ON' : 'OFF'}`,
    `라운드: ${ROUND_TEXT[s.round] ?? s.round}`,
    `문제 수: ${s.numProblems}개${s.round === 0 ? '/라운드' : ''}`,
    `시간 제한: ${s.timeLimit}초`,
  ],
  metrics: (results) => ({
    accuracy: accuracyOf(results),
    averageTimeMs: averageOf(results, (r) => r.solveTime),
    averageClickCount: averageOf(results, (r) => r.clickCount),
  }),
  metricOptions: [
    { value: 'accuracy', label: '정답률 (%)' },
    { value: 'averageTimeMs', label: '평균 해결 시간 (ms)' },
    { value: 'averageClickCount', label: '평균 클릭 수' },
  ],
  breakdowns: (results) => [
    { title: '라운드별', rows: groupRows(results, (r) => `${ROUND_TEXT[r.problem.Round]}`, (r) => r.solveTime, ['알파벳', '격자']) },
    { title: '최소 횟수별', rows: groupRows(results, (r) => `최소 ${r.problem.MinMoves}번`, (r) => r.solveTime, ['최소 1번', '최소 2번', '최소 3번']) },
  ],
};
