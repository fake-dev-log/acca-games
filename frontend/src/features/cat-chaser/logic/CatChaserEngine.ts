import { CatChaserGameState, CatChaserProblem, CatChaserResult, CatChaserSettings } from './types';

export class CatChaserEngine {
  private currentState: CatChaserGameState | null = null;
  private results: CatChaserResult[] = [];

  public startGame(settings: CatChaserSettings): CatChaserGameState {
    const problems = this.generateProblems(settings.numTrials, settings.difficulty);
    const sessionId = Date.now();

    this.currentState = {
      settings,
      problems,
      id: sessionId,
    };
    this.results = [];

    return this.currentState;
  }

  public submitAnswer(
    round: number,
    targetColor: 'RED' | 'BLUE',
    playerChoice: 'CAUGHT' | 'MISSED' | 'TIMEOUT',
    confidence: number,
    responseTimeMs: number
  ): CatChaserResult {
    if (!this.currentState) throw new Error("Game not started");
    if (round < 1 || round > this.currentState.problems.length) throw new Error("Invalid round");

    const problem = this.currentState.problems[round - 1];
    
    let correctChoice: 'CAUGHT' | 'MISSED';
    if (targetColor === 'RED') {
      correctChoice = problem.redCatStatus;
    } else {
      correctChoice = problem.blueCatStatus;
    }

    let isCorrect = playerChoice === correctChoice;
    let score = 0;

    if (playerChoice === 'TIMEOUT') {
      isCorrect = false;
      score = -1.0;
    } else {
      let confidenceMultiplier = 0.0;
      switch (confidence) {
        case 1: confidenceMultiplier = 0.1; break;
        case 2: confidenceMultiplier = 0.5; break;
        case 3: confidenceMultiplier = 1.0; break;
        case 4: confidenceMultiplier = 2.0; break;
      }

      if (isCorrect) {
        score = 1.0 * confidenceMultiplier;
      } else {
        score = -1.0 * confidenceMultiplier;
      }
    }

    const result: CatChaserResult = {
      sessionId: this.currentState.id,
      round,
      targetColor,
      playerChoice,
      confidence,
      correctChoice,
      isCorrect,
      score,
      responseTimeMs,
    };

    this.results.push(result);
    return result;
  }

  public getResults(): CatChaserResult[] {
    return this.results;
  }

  private generateProblems(numTrials: number, difficulty: string): CatChaserProblem[] {
    const problems: CatChaserProblem[] = [];
    const mouseCounts: number[] = [];

    if (difficulty === 'auto') {
      const levels = [4, 6, 8, 10, 12, 16];
      for (let i = 0; i < numTrials; i++) {
        let levelIdx = Math.floor((i * levels.length) / numTrials);
        if (levelIdx >= levels.length) levelIdx = levels.length - 1;
        mouseCounts.push(levels[levelIdx]);
      }
    } else {
      let count = parseInt(difficulty, 10);
      if (isNaN(count) || count < 4) count = 4;
      for (let i = 0; i < numTrials; i++) {
        mouseCounts.push(count);
      }
    }

    for (let i = 0; i < numTrials; i++) {
      problems.push(this.generateSingleProblem(i + 1, mouseCounts[i]));
    }

    return problems;
  }

  private generateSingleProblem(round: number, numMice: number): CatChaserProblem {
    const gridSize = 36;
    const indices = Array.from({ length: gridSize }, (_, k) => k);

    // Shuffle indices for mice
    this.shuffle(indices);
    const micePositions = indices.slice(0, numMice);

    // Shuffle indices for cats (independent shuffle)
    const catIndicesPool = Array.from({ length: gridSize }, (_, k) => k);
    this.shuffle(catIndicesPool);
    const catPositions = catIndicesPool.slice(0, numMice);

    // Select 2 target cats indices (0 to numMice-1)
    const targetIndices = Array.from({ length: numMice }, (_, k) => k);
    this.shuffle(targetIndices);
    const redCatIndex = targetIndices[0];
    const blueCatIndex = targetIndices[1];

    const redCatPos = catPositions[redCatIndex];
    const blueCatPos = catPositions[blueCatIndex];

    const redCatStatus = micePositions.includes(redCatPos) ? 'CAUGHT' : 'MISSED';
    const blueCatStatus = micePositions.includes(blueCatPos) ? 'CAUGHT' : 'MISSED';

    return {
      round,
      micePositions,
      catPositions,
      redCatIndex,
      blueCatIndex,
      redCatStatus,
      blueCatStatus,
    };
  }

  private shuffle(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}

export const catChaserEngine = new CatChaserEngine();
