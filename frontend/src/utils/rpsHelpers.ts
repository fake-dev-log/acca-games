import { types } from '@wails/go/models';

export function parseSettings(settingsJson: string): types.RpsSettings | null {
  try {
    return new types.RpsSettings(JSON.parse(settingsJson));
  } catch (e) {
    console.error('Failed to parse RPS settings:', e);
    return null;
  }
}

export function formatSettings(settings: types.RpsSettings): string[] {
    const rounds = settings.rounds.join(', ');
    const mode = settings.isRealMode ? '실전' : '연습';
    return [
        `문제: ${settings.questionsPerRound}개/라운드`,
        `시간: ${settings.timeLimitMs / 1000}초`,
        `라운드: ${rounds}`,
        `모드: ${mode}`
    ];
}
