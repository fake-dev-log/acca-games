import { types } from '@wails/go/models';

// Helper function to parse settings JSON for any game
export const parseSettings = (settingsJson: string): any | null => {
  try {
    return JSON.parse(settingsJson);
  } catch (e) {
    console.error('Error parsing settings JSON:', e);
    return null;
  }
};

// Helper function to format settings for display
export const formatSettings = (settingsJson: string): string => {
  const settings = parseSettings(settingsJson);
  if (!settings) return settingsJson;

  // N-Back specific formatting
  if ('nBackLevel' in settings) {
    const level = settings.nBackLevel === 1 ? '2-back' : '2 & 3-back';
    const shapeGroup = settings.shapeGroup === 'random' ? '랜덤' : `${(settings.shapeGroup || '').replace('group', '')}번 세트`;
    return `문제: ${settings.numTrials}개, 시간: ${settings.presentationTime / 1000}초, 라운드: ${level}, 도형: ${shapeGroup}`;
  }
  
  // RPS specific formatting (example)
  if ('questionsPerRound' in settings) {
    const rounds = settings.rounds.join(', ');
    return `문제: ${settings.questionsPerRound}개/라운드, 시간: ${settings.timeLimitMs / 1000}초, 라운드: ${rounds}`;
  }

  return settingsJson; // Fallback for other game types
};
