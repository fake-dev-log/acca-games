import { types } from '@wails/go/models';
import { createSettingsParser } from './settingsHelper';

export const parseSettings = createSettingsParser(types.RpsSettings, 'RPS');

export function formatSettings(settings: types.RpsSettings): string[] {
    return [
        `실전 모드: ${settings.isRealMode ? 'ON' : 'OFF'}`,
        `라운드: ${settings.rounds.join(', ')}`,
        `문제 수: ${settings.questionsPerRound}개/라운드`,
        `시간 제한: ${settings.timeLimitMs / 1000}초`
    ];
}
