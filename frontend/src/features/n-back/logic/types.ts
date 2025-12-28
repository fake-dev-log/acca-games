export interface NBackSettings {
  numTrials: number;
  presentationTime: number; // in milliseconds
  nBackLevel: number;     // 1 for 2-back, 2 for 2-back & 3-back mix
  shapeGroup: string;
  isRealMode: boolean;
}

export interface NBackGameState {
  settings: NBackSettings;
  shapeSequence: string[];
  id: number;
}

export interface NBackResult {
  sessionId: number;
  round: number;
  questionNum: number;
  isCorrect: boolean;
  responseTimeMs: number;
  playerChoice: string; // "LEFT", "RIGHT", "SPACE"
  correctChoice: string; // "LEFT", "RIGHT", "SPACE"
  presentedShape: string; // Helper for display
}
