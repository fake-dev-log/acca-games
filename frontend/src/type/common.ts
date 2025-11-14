// frontend/src/type/common.ts

export interface BaseGameSessionInfo {
  id: number;
  gameCode: string;
  playDatetime: any; // Go type: CustomTime, which becomes any in TS
  settings: string; // JSON string
}

export interface BaseGameSessionWithResults extends BaseGameSessionInfo {
  results: any; // This will be game-specific, so `any` is appropriate for the base
}
