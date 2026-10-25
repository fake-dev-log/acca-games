export interface AppointmentSettings {
  rounds: number[]; // 1 요일 · 2 위치 · 3 메뉴 · 4 버스
  problemsPerRound: number;
  presentationTimeMs: number; // 사람 한 명을 보여 주는 시간
  responseTimeLimitMs: number;
  isRealMode: boolean;
}

export interface AppointmentProblem {
  round: number;
  questionNum: number; // 전체 연번, 1부터
  itemsPerPerson: number;
  people: string[][]; // 세 사람이 각각 보여 주는 항목
  options: string[]; // 질문 화면의 선택지(표시 순서)
  answer: string;
}

export interface AppointmentGameState {
  settings: AppointmentSettings;
  problems: AppointmentProblem[];
  id: number;
}

export interface AppointmentResult {
  sessionId: number;
  round: number;
  questionNum: number;
  itemsPerPerson: number;
  people: string[][];
  answer: string;
  playerChoice: string | null; // null = 시간 초과
  isCorrect: boolean;
  responseTimeMs: number;
}
