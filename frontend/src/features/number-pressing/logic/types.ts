export interface NumberPressingSetup {
  isRealMode: boolean;
  rounds: number[];
  problemsPerRound: number;
  timeLimitR1: number; // in seconds
  timeLimitR2: number; // in seconds
}

export interface NumberPressingProblemR1 {
  targetNumber: number;
}

export interface NumberPressingProblemR2 {
  doubleClick: number[];
  skip: number[];
}

export interface NumberPressingGameState {
  setup: NumberPressingSetup;
  problemsR1: NumberPressingProblemR1[];
  problemsR2: NumberPressingProblemR2[];
  id: number;
}

export interface NumberPressingResultR1 {
  sessionId: number;
  problem: NumberPressingProblemR1;
  timeTaken: number; // in seconds
  isCorrect: boolean;
}

export interface NumberPressingResultR2 {
  sessionId: number;
  problem: NumberPressingProblemR2;
  playerClicks: number[];
  correctClicks: number[];
  timeTaken: number; // in seconds
  isCorrect: boolean;
}

export interface NumberPressingResultsBundle {
  resultsR1: NumberPressingResultR1[];
  resultsR2: NumberPressingResultR2[];
}

export type NumberPressingResult = NumberPressingResultR1 | NumberPressingResultR2;
