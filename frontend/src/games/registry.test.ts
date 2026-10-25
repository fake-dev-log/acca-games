import { describe, it, expect } from 'vitest';
import { GAMES, findGameBySlug } from './registry';

describe('game registry', () => {
  it('has unique codes and slugs', () => {
    expect(new Set(GAMES.map((g) => g.code)).size).toBe(GAMES.length);
    expect(new Set(GAMES.map((g) => g.slug)).size).toBe(GAMES.length);
  });

  it('formats each game\'s default settings and lists an accuracy metric first', () => {
    for (const game of GAMES) {
      expect(game.metricOptions[0].value).toBe('accuracy');
      expect(game.metrics([])).toHaveProperty('accuracy', 0);
      for (const option of game.metricOptions) {
        expect(game.metrics([])).toHaveProperty(option.value);
      }
    }
  });

  it('returns empty breakdown rows for no results', () => {
    for (const game of GAMES) {
      for (const b of game.breakdowns?.([]) ?? []) expect(b.rows).toEqual([]);
    }
  });

  it('finds games by slug and returns undefined otherwise', () => {
    expect(findGameBySlug('rps')?.title).toBe('가위바위보');
    expect(findGameBySlug('nope')).toBeUndefined();
    expect(findGameBySlug(undefined)).toBeUndefined();
  });
});
