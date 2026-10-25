import { NumberPressingSetup, NumberPressingGameState, NumberPressingProblemR1, NumberPressingProblemR2, NumberPressingResultR1, NumberPressingResultR2, NumberPressingResultsBundle } from './types';

export class NumberPressingEngine {
  private currentState: NumberPressingGameState | null = null;
  private resultsR1: NumberPressingResultR1[] = [];
  private resultsR2: NumberPressingResultR2[] = [];

  public startGame(setup: NumberPressingSetup): NumberPressingGameState {
    const problemsR1 = this.generateProblemsR1(setup.rounds.includes(1) ? setup.problemsPerRound : 0);
    const problemsR2 = this.generateProblemsR2(setup.rounds.includes(2) ? setup.problemsPerRound : 0);
    const sessionId = Date.now();

    this.currentState = {
      setup,
      problemsR1,
      problemsR2,
      id: sessionId,
    };
    this.resultsR1 = [];
    this.resultsR2 = [];

    return this.currentState;
  }

  public submitResultR1(result: NumberPressingResultR1): void {
    if (!this.currentState) throw new Error("Game not started");
    this.resultsR1.push(result);
  }

  public submitResultR2(result: NumberPressingResultR2): void {
    if (!this.currentState) throw new Error("Game not started");
    this.resultsR2.push(result);
  }

  public getResults(): NumberPressingResultsBundle {
    return {
      resultsR1: this.resultsR1,
      resultsR2: this.resultsR2,
    };
  }

  public calculateCorrectClicksR2(problem: NumberPressingProblemR2): number[] {
    const correctClicks: number[] = [];
    
    const isSkipped = new Set(problem.skip);
    const isDoubleClick = new Set(problem.doubleClick);

    for (let i = 1; i <= 9; i++) {
      if (isSkipped.has(i)) {
        continue;
      }
      correctClicks.push(i);
      if (isDoubleClick.has(i)) {
        correctClicks.push(i);
      }
    }
    return correctClicks;
  }

  private generateProblemsR1(count: number): NumberPressingProblemR1[] {
    const problems: NumberPressingProblemR1[] = [];
    for (let i = 0; i < count; i++) {
      problems.push({
        targetNumber: Math.floor(Math.random() * 9) + 1,
      });
    }
    return problems;
  }

  private generateProblemsR2(count: number): NumberPressingProblemR2[] {
    const problems: NumberPressingProblemR2[] = [];
    for (let i = 0; i < count; i++) {
      const doubleClickCount = Math.floor(Math.random() * 3); // 0, 1, or 2
      let skipCount = Math.floor(Math.random() * 3);        // 0, 1, or 2

      // Ensure not too many skips if there are double clicks (matching Go logic)
      if (skipCount === 2 && doubleClickCount > 0) {
        skipCount = 1;
      }

      const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      // Shuffle nums
      for (let j = nums.length - 1; j > 0; j--) {
        const k = Math.floor(Math.random() * (j + 1));
        [nums[j], nums[k]] = [nums[k], nums[j]];
      }

      const doubleClick = nums.slice(0, doubleClickCount).sort((a, b) => a - b);
      const remainingNums = nums.slice(doubleClickCount);
      
      if (remainingNums.length < skipCount) {
        skipCount = remainingNums.length;
      }
      const skip = remainingNums.slice(0, skipCount).sort((a, b) => a - b);

      problems.push({
        doubleClick,
        skip,
      });
    }
    return problems;
  }
}

export const numberPressingEngine = new NumberPressingEngine();
