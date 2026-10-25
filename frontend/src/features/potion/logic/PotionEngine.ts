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
const MIN_REPEAT_GAP = 3; // 같은 조합은 최소 3문제 간격을 두고 다시 나온다

// 실전: 100문항 · 3초 · 우세 색 80% · 레시피 변경 있음
export const REAL_SETTINGS: PotionSettings = {
  numTrials: 100, responseTimeLimitMs: 3000, dominantProbability: 0.8, recipeChange: true, isRealMode: true,
};

// 조합 순서: 지금까지 덜 나온 조합을 우선하되, 바로 앞 몇 문제에 나온 조합은 피한다
function comboSequence(n: number): number[][] {
  const counts = new Map(COMBOS.map((c) => [comboKey(c), 0]));
  const sequence: number[][] = [];
  for (let i = 0; i < n; i++) {
    const recent = new Set(sequence.slice(-(MIN_REPEAT_GAP - 1)).map(comboKey));
    const allowed = COMBOS.filter((c) => !recent.has(comboKey(c)));
    const least = Math.min(...allowed.map((c) => counts.get(comboKey(c))!));
    const candidates = allowed.filter((c) => counts.get(comboKey(c)) === least);
    const combo = candidates[Math.floor(Math.random() * candidates.length)];
    counts.set(comboKey(combo), least + 1);
    sequence.push(combo);
  }
  return sequence;
}

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

    const sequence = comboSequence(n);
    const seen = new Set<string>();
    const seenAfterChange = new Set<string>();
    const trials: PotionTrial[] = sequence.map((combo, i) => {
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
