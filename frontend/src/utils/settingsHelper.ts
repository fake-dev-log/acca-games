// frontend/src/utils/settingsHelper.ts
import { safeParse } from './parsing';

/**
 * Creates a settings parser function for a specific game type.
 * This factory abstracts the logic of safely parsing settings data and instantiating a Wails model.
 * @param constructor The Wails model constructor (e.g., types.NBackSettings).
 * @param gameName The name of the game for logging purposes.
 * @returns A function that takes a settings object or string and returns an instance of the model or null.
 */
export function createSettingsParser<T>(
  constructor: new (data: any) => T,
  gameName: string
): (settings: string | object) => T | null {
  return (settings: string | object): T | null => {
    const settingsObj = safeParse(settings);
    if (!settingsObj) {
      console.error(`Failed to parse settings for ${gameName}.`);
      return null;
    }
    try {
      // @ts-ignore
      return new constructor(settingsObj);
    } catch (e) {
      console.error(`Error creating ${gameName} settings instance:`, e);
      return null;
    }
  };
}
