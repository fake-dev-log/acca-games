import { types } from '@wails/go/models';
import { createSettingsParser } from './settingsHelper';

export const parseSettings = createSettingsParser(types.CatChaserSettings, 'Cat Chaser');

export const formatSettings = (settings: types.CatChaserSettings): string[] => {
  const difficultyText = settings.difficulty === 'auto' 
      ? '자동 (난이도 증가)' 
      : `${settings.difficulty}마리`;

  return [
    `실전 모드: ${settings.isRealMode ? 'ON' : 'OFF'}`,
    `문제 수: ${settings.numTrials}개`,
    `난이도: ${difficultyText}`,
    `제시 시간: ${settings.showTime}초`,
    `응답 제한 시간: ${settings.responseTimeLimit}초`,
  ];
};
