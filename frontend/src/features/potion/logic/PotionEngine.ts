import { PotionColor, PotionGameState, PotionResult, PotionSettings, PotionTrial } from './types';

export const INGREDIENTS = [
  { emoji: '🍄', name: '버섯' },
  { emoji: '🌿', name: '약초' },
  { emoji: '🦎', name: '도마뱀 꼬리' },
  { emoji: '💎', name: '수정' },
];

// 카드 4장 중 1~3장이 공개되는 14가지 조합
export const COMBOS: number[][] = Array.from({ length: 15 }, (_, mask) => mask + 1)
  .map((mask) => [0, 1, 2, 3].filter((i) => mask & (1 << i)))
  .filter((combo) => combo.length <= 3)
  .sort((a, b) => a.length - b.length || a.join().localeCompare(b.join()));

export const CHANGED_COMBO_COUNT = 4;

export const comboKey = (combo: number[]) => combo.join(',');
export const flip = (color: PotionColor): PotionColor => (color === 'RED' ? 'BLUE' : 'RED');

const shuffle = <T>(items: T[]): T[] => {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export class PotionEngine {
  private state: PotionGameState | null = null;
  private results: PotionResult[] = [];

  public startGame(settings: PotionSettings): PotionGameState {
    const n = settings.numTrials;
    // 레시피: 14가지 조합 중 7가지는 빨강, 7가지는 파랑이 우세
    const recipe = new Map<string, PotionColor>(
      shuffle(COMBOS).map((combo, i) => [comboKey(combo), i % 2 === 0 ? 'RED' : 'BLUE']),
    );
    const changeAt = settings.recipeChange ? Math.floor(n * (0.4 + Math.random() * 0.2)) + 1 : null;
    const changed = new Set(shuffle(COMBOS).slice(0, CHANGED_COMBO_COUNT).map(comboKey));

    // 14개씩 묶어 섞어서 조합이 고르게 나오게 한다
    const sequence: number[][] = [];
    while (sequence.length < n) sequence.push(...shuffle(COMBOS));

    const seen = new Set<string>();
    const seenAfterChange = new Set<string>();
    const trials: PotionTrial[] = sequence.slice(0, n).map((combo, i) => {
      const trialNum = i + 1;
      const key = comboKey(combo);
      const phase = changeAt !== null && trialNum >= changeAt ? 'after' : 'before';
      const changedCombo = phase === 'after' && changed.has(key);
      const dominant = changedCombo ? flip(recipe.get(key)!) : recipe.get(key)!;
      const outcome = Math.random() < settings.dominantProbability ? dominant : flip(dominant);

      let scored = seen.has(key);
      seen.add(key);
      if (changedCombo) {
        if (!seenAfterChange.has(key)) scored = false;
        seenAfterChange.add(key);
      }
      return { trialNum, combo, dominant, outcome, phase, changedCombo, scored };
    });

    this.state = { settings, trials, changeAt, id: Date.now() };
    this.results = [];
    return this.state;
  }

  public submitAnswer(trialNum: number, playerChoice: PotionColor | null, responseTimeMs: number): PotionResult {
    if (!this.state) throw new Error('Game not started');
    const trial = this.state.trials[trialNum - 1];
    if (!trial) throw new Error('Invalid trial number');
    const result: PotionResult = {
      ...trial,
      sessionId: this.state.id,
      playerChoice,
      isCorrect: playerChoice === trial.dominant,
      responseTimeMs,
    };
    this.results.push(result);
    return result;
  }

  public getResults(): PotionResult[] {
    return this.results;
  }
}

export const potionEngine = new PotionEngine();
