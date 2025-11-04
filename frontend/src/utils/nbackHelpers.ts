import { types } from '@wails/go/models';

export function parseSettings(settingsJson: string): types.NBackSettings | null {
  try {
    // The Wails model constructor can take a plain object.
    return new types.NBackSettings(JSON.parse(settingsJson));
  } catch (e) {
    console.error('Error parsing N-Back settings JSON:', e);
    return null;
  }
}

export function formatSettings(settings: types.NBackSettings): string[] {
  const level = settings.nBackLevel === 1 ? '2-back' : '2 & 3-back';
  const shapeGroup = settings.shapeGroup === 'random' ? '랜덤' : `${(settings.shapeGroup || '').replace('group', '')}번 세트`;
  const mode = settings.isRealMode ? '실전' : '연습';
  return [
    `문제: ${settings.numTrials}개`,
    `시간: ${settings.presentationTime / 1000}초`,
    `라운드: ${level}`,
    `도형: ${shapeGroup}`,
    `모드: ${mode}`
  ];
}
