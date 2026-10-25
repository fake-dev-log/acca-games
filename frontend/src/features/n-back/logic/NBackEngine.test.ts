import { describe, it, expect } from 'vitest';
import { NBackEngine } from './NBackEngine';
import { NBackSettings } from './types';

describe('NBackEngine Sequence Generation', () => {
  const engine = new NBackEngine();

  const baseSettings: NBackSettings = {
    nBackLevel: 1,
    numTrials: 50,
    presentationTime: 1000,
    shapeGroup: 'group1',
    isRealMode: false,
  };

  const isValidSequence = (seq: string[]): boolean => {
    let streak = 1;
    for (let i = 1; i < seq.length; i++) {
      if (seq[i] === seq[i - 1]) {
        streak++;
      } else {
        streak = 1;
      }
      if (streak > 2) {
        return false;
      }
    }
    return true;
  };

  it('should not have more than 2 consecutive identical shapes', () => {
    const iterations = 100;
    for (let i = 0; i < iterations; i++) {
      const state = engine.startGame(baseSettings);
      const seq = state.shapeSequence;
      
      expect(isValidSequence(seq)).toBe(true);
    }
  });

  it('should generate sequence of correct length', () => {
    const state = engine.startGame(baseSettings);
    expect(state.shapeSequence).toHaveLength(baseSettings.numTrials);
  });
});
