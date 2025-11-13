import { types } from '@wails/go/models';

// The settings object from the backend is already parsed in the store
type ShapeRotationSettings = types.ShapeRotationSettings;

export const formatSettings = (settings: ShapeRotationSettings): string[] => {
  const roundText = settings.round === 1 ? '알파벳' : settings.round === 2 ? '격자' : '알 수 없음';
  return [
    `문제 수: ${settings.numProblems}`,
    `시간 제한: ${settings.timeLimit}초`,
    `라운드: ${roundText}`,
    `실전 모드: ${settings.isRealMode ? 'ON' : 'OFF'}`,
  ];
};
