export interface CatChaserSettings {
  numTrials: number;
  difficulty: string; // "auto" or number as string
  showTime: number; // ms
  responseTimeLimit: number; // ms
  isRealMode: boolean;
}

export interface CatChaserProblem {
  round: number;
  micePositions: number[];
  catPositions: number[];
  redCatIndex: number;
  blueCatIndex: number;
  redCatStatus: 'CAUGHT' | 'MISSED'; // Helper for validation
  blueCatStatus: 'CAUGHT' | 'MISSED'; // Helper for validation
}

export interface CatChaserGameState {
  settings: CatChaserSettings;
  problems: CatChaserProblem[];
  id: number;
}

export interface CatChaserResult {
  sessionId: number;
  round: number;
  targetColor: 'RED' | 'BLUE';
  playerChoice: 'CAUGHT' | 'MISSED' | 'TIMEOUT';
  confidence: number;
  correctChoice: 'CAUGHT' | 'MISSED';
  isCorrect: boolean;
  score: number;
  responseTimeMs: number;
}

export interface CatChaserSessionWithResults {
    id: number;
    gameCode: string;
    playDatetime: string;
    settings: string;
    results: CatChaserResult[];
}