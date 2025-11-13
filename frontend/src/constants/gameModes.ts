export const GameModes = {
  SETUP: 'setup',
  LOADING: 'loading',
  PLAYING: 'playing',
  RESULT: 'result'
}

export type GameMode = (typeof GameModes)[keyof typeof GameModes];
