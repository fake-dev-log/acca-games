export interface RpsSettings {
  rounds: number[];
  questionsPerRound: number;
  timeLimitMs: number;
  isRealMode: boolean;
}

export interface Problem {
  round: number;
  questionNum: number;
  problemCardHolder: string;
  givenCard: string;
  correctChoice: string;
}

export interface GameState {
  settings: RpsSettings;
  problems: Problem[];
  id: number;
  gameCode: string;
}

export interface RpsResult {
  sessionId: number;
  round: number;
  questionNum: number;
  problemCardHolder: string;
  givenCard: string;
  isCorrect: boolean;
  responseTimeMs: number;
  playerChoice: string;
  correctChoice: string;
}
