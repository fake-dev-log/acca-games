import { types } from '@wails/go/models';
import { createSettingsParser } from './settingsHelper';

export const parseSettings = createSettingsParser(types.NumberPressingSetup, 'Number Pressing');

export function formatSettings(settings: types.NumberPressingSetup): string[] {
    return [
        `실전 모드: ${settings.isRealMode ? 'ON' : 'OFF'}`,
        `라운드: ${settings.rounds.join(', ')}`,
        `문제 수: ${settings.problemsPerRound}개`,
        `시간 제한: R1 ${settings.timeLimitR1}초 / R2 ${settings.timeLimitR2}초`
    ];
}
