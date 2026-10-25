import { GameDefinition } from '@games/types';
import { accuracyOf, averageOf, groupRows } from '@games/stats';
import { GameCodes, GameCodeSlugs } from '@constants/gameCodes';
import { useAppointmentStore } from './stores/appointmentStore';
import { AppointmentGameSetup } from './components/AppointmentGameSetup';
import { AppointmentGame } from './components/AppointmentGame';
import { AppointmentResultDetail } from './components/AppointmentResultDetail';
import { ROUND_INFO } from './logic/AppointmentEngine';
import { AppointmentResult, AppointmentSettings } from './logic/types';

const roundLabel = (round: number) => `${round}라운드 (${ROUND_INFO[round].name})`;

export const appointmentGame: GameDefinition<AppointmentSettings, AppointmentResult> = {
  code: GameCodes.APPOINTMENT,
  slug: GameCodeSlugs.APPOINTMENT,
  title: '약속 정하기',
  description: '세 사람의 선호를 차례로 기억해 모두 겹치는 것(4라운드는 아무도 안 탄 버스)을 고른다 (작업기억)',
  useStore: useAppointmentStore,
  Setup: AppointmentGameSetup,
  Game: AppointmentGame,
  ResultDetail: AppointmentResultDetail,
  selectRecord: (state) => ({ settings: state.gameState!.settings, results: state.results }),
  formatSettings: (s) => [
    `실전 모드: ${s.isRealMode ? 'ON' : 'OFF'}`,
    `라운드: ${s.rounds.join(', ')}`,
    `문제 수: ${s.problemsPerRound}개/라운드`,
    `제시 시간: 한 사람 ${s.presentationTimeMs / 1000}초`,
    `응답 제한 시간: ${s.responseTimeLimitMs / 1000}초`,
  ],
  metrics: (results) => ({
    accuracy: accuracyOf(results),
    averageTimeMs: averageOf(results, (r) => r.responseTimeMs),
    busAccuracy: accuracyOf(results.filter((r) => r.round === 4)),
  }),
  metricOptions: [
    { value: 'accuracy', label: '정답률 (%)' },
    { value: 'averageTimeMs', label: '평균 응답 시간 (ms)' },
    { value: 'busAccuracy', label: '4라운드(버스) 정답률 (%)' },
  ],
  breakdowns: (results) => [
    { title: '라운드별', rows: groupRows(results, (r) => roundLabel(r.round), (r) => r.responseTimeMs, [1, 2, 3, 4].map(roundLabel)) },
    { title: '한 사람이 보여 준 항목 수별', rows: groupRows([...results].sort((a, b) => a.itemsPerPerson - b.itemsPerPerson), (r) => `${r.itemsPerPerson}개`, (r) => r.responseTimeMs) },
  ],
};
