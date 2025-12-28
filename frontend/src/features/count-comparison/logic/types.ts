export interface CountComparisonSettings {
  numProblems: number;
  presentationTime: number; // in milliseconds
  inputTime: number;        // in milliseconds
  isRealMode: boolean;
}

export interface WordDetail {
  text: string;
  size: number;
  weight: number;
  isGap: boolean;
  gapWidth: number;
}

export interface AppliedTrap {
  type: string;
  appliedTo: string;
}

export interface DensityParams {
  areaMultiplier: number;
  gapProbability: number;
}

export interface DensityInfo {
  left: DensityParams;
  right: DensityParams;
}

export interface CountComparisonProblem {
  problemNumber: number;
  leftWords: WordDetail[];
  rightWords: WordDetail[];
  leftWordText: string;
  rightWordText: string;
  density: DensityInfo;
  presentationTime: number;
  inputTime: number;
  correctSide: string; // "left" or "right"
  appliedTraps: AppliedTrap[];
}

export interface CountComparisonSubmission {
  problemNumber: number;
  playerChoice: string; // "left" or "right"
  responseTimeMs: number;
}

export interface CountComparisonResult {
  sessionId: number;
  problemNumber: number;
  isCorrect: boolean;
  responseTimeMs: number;
  playerChoice: string;
  correctChoice: string;
  leftWord: string;
  rightWord: string;
  leftWordCount: number;
  rightWordCount: number;
  appliedTraps: AppliedTrap[];
}
