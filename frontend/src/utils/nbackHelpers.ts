import { types } from '@wails/go/models';
import { createSettingsParser } from './settingsHelper';

export const parseSettings = createSettingsParser(types.NBackSettings, 'N-Back');

export function formatSettings(settings: types.NBackSettings): string[] {
  const level = settings.nBackLevel === 1 ? '2-back' : '2 & 3-back';
  const shapeGroup = settings.shapeGroup === 'random' ? '랜덤' : `${(settings.shapeGroup || '').replace('group', '')}번 세트`;
  return [
    `실전 모드: ${settings.isRealMode ? 'ON' : 'OFF'}`,
    `N-Back 레벨: ${level}`,
    `문제 수: ${settings.numTrials}개`,
    `제시 시간: ${settings.presentationTime / 1000}초`,
    `도형: ${shapeGroup}`
  ];
}
