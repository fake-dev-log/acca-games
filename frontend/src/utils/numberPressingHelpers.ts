import { types } from '@wails/go/models';

export function parseSettings(settingsJson: string): types.NumberPressingSetup | null {
  try {
    return new types.NumberPressingSetup(JSON.parse(settingsJson));
  } catch (e) {
    console.error('Failed to parse number pressing settings:', e);
    return null;
  }
}

export function formatSettings(settings: types.NumberPressingSetup): string[] {
    const rounds = settings.rounds.join(', ');
    const problems = `${settings.problemsPerRound}개`;
    const timeLimits = `R1: ${settings.timeLimitR1}초 / R2: ${settings.timeLimitR2}초`;
    const mode = settings.isRealMode ? '실전' : '연습';

    return [
        `라운드: ${rounds}`,
        `문제: ${problems}`,
        `시간: ${timeLimits}`,
        `모드: ${mode}`
    ];
}
