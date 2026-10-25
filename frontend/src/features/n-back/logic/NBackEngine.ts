import { NBackGameState, NBackResult, NBackSettings } from './types';

export const SHAPE_GROUPS: Record<string, string[]> = {
  "group1": ["circle", "triangle", "square"],
  "group2": ["trapezoid", "hourglass", "diamond"],
  "group3": ["rhombus", "butterfly", "star"],
  "group4": ["check", "horns", "pyramid"],
  "group5": ["double_triangle", "x_shape", "crown"],
};

export class NBackEngine {
  private currentState: NBackGameState | null = null;
  private results: NBackResult[] = [];

  public startGame(settings: NBackSettings): NBackGameState {
    const shapeSequence = this.generateShapeSequence(settings.numTrials, settings.shapeGroup, settings.nBackLevel);
    const sessionId = Date.now();

    this.currentState = {
      settings,
      shapeSequence,
      id: sessionId,
    };
    this.results = [];

    return this.currentState;
  }

  public submitAnswer(playerChoice: string, responseTimeMs: number, questionNum: number): NBackResult {
    if (!this.currentState) throw new Error("Game not started");

    const correctChoice = this.determineCorrectChoice(this.currentState.shapeSequence, questionNum, this.currentState.settings.nBackLevel);
    const isCorrect = playerChoice === correctChoice;

    const result: NBackResult = {
      sessionId: this.currentState.id,
      round: 1, // Defaulting to 1 as per original logic
      questionNum,
      isCorrect,
      responseTimeMs,
      playerChoice,
      correctChoice,
      presentedShape: this.currentState.shapeSequence[questionNum],
    };

    this.results.push(result);
    return result;
  }

  public getResults(): NBackResult[] {
    return this.results;
  }

  private generateShapeSequence(numTrials: number, shapeGroup: string, nBackLevel: number): string[] {
    let shapeSet = SHAPE_GROUPS[shapeGroup];
    if (!shapeSet || shapeSet.length === 0) {
      shapeSet = SHAPE_GROUPS["group1"];
    }

    // Create a pool of shapes with a balanced distribution
    const shapePool: string[] = [];
    for (let i = 0; i < numTrials; i++) {
      shapePool.push(shapeSet[i % shapeSet.length]);
    }

    const maxRestarts = 100;
    for (let r = 0; r < maxRestarts; r++) {
      // Fisher-Yates Shuffle
      for (let i = shapePool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shapePool[i], shapePool[j]] = [shapePool[j], shapePool[i]];
      }

      // Try to fix violations by swapping
      let valid = true;
      for (let i = 2; i < shapePool.length; i++) {
        if (shapePool[i] === shapePool[i - 1] && shapePool[i] === shapePool[i - 2]) {
          // Found violation: shapePool[i] creates a 3-streak
          let fixed = false;
          // Look for a swap candidate in the rest of the array
          for (let j = i + 1; j < shapePool.length; j++) {
            // We need a shape that is DIFFERENT from shapePool[i-1] (the streak value)
            if (shapePool[j] !== shapePool[i - 1]) {
              [shapePool[i], shapePool[j]] = [shapePool[j], shapePool[i]];
              fixed = true;
              break;
            }
          }

          if (!fixed) {
            // Could not fix (e.g., all remaining items are the same).
            // Restart the whole process.
            valid = false;
            break;
          }
        }
      }

      if (valid) {
        return shapePool;
      }
    }

    return shapePool;
  }

  private determineCorrectChoice(sequence: string[], questionNum: number, nBackLevel: number): string {
    // Note: questionNum is 0-based index in the sequence array.
    
    if (nBackLevel === 1) { // 2-back only
      if (questionNum < 2) {
        return "SPACE"; // Not enough history
      }
      if (sequence[questionNum] === sequence[questionNum - 2]) {
        return "LEFT";
      } else {
        return "SPACE";
      }
    } else { // 2-back and 3-back mix
      const match2Back = questionNum >= 2 && sequence[questionNum] === sequence[questionNum - 2];
      const match3Back = questionNum >= 3 && sequence[questionNum] === sequence[questionNum - 3];

      if (match2Back) {
        return "LEFT";
      } else if (match3Back) {
        return "RIGHT";
      } else {
        return "SPACE";
      }
    }
  }
}

export const nBackEngine = new NBackEngine();
