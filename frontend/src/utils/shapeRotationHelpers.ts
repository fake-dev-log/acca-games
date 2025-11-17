import { types } from '@wails/go/models';
import { createSettingsParser } from './settingsHelper';

export const parseSettings = createSettingsParser(types.ShapeRotationSettings, 'Shape Rotation');

export const formatSettings = (settings: types.ShapeRotationSettings): string[] => {
  const roundText = settings.round === 1 ? '알파벳' : settings.round === 2 ? '격자' : '알 수 없음';
  return [
    `실전 모드: ${settings.isRealMode ? 'ON' : 'OFF'}`,
    `라운드: ${roundText}`,
    `문제 수: ${settings.numProblems}개`,
    `시간 제한: ${settings.timeLimit}초`,
  ];
};
