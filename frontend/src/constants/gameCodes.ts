export const GameCodes = {
  SHAPE_ROTATION: 'SHAPE_ROTATION',
  RPS: 'RPS',
  N_BACK: 'N_BACK',
  NUMBER_PRESSING: 'NUMBER_PRESSING',
  COUNT_COMPARISON: 'COUNT_COMPARISON',
  CAT_CHASER: 'CAT_CHASER',
  APPOINTMENT: 'APPOINTMENT',
  PATH: 'PATH',
  POTION: 'POTION',
} as const;

export type GameCode = (typeof GameCodes)[keyof typeof GameCodes];

export const GameCodeSlugs = {
  [GameCodes.SHAPE_ROTATION]: 'shape-rotation',
  [GameCodes.RPS]: 'rps',
  [GameCodes.N_BACK]: 'n-back',
  [GameCodes.NUMBER_PRESSING]: 'number-pressing',
  [GameCodes.COUNT_COMPARISON]: 'count-comparison',
  [GameCodes.CAT_CHASER]: 'cat-chaser',
  [GameCodes.APPOINTMENT]: 'appointment',
  [GameCodes.PATH]: 'path',
  [GameCodes.POTION]: 'potion',
} as const;

export type GameCodeSlug = (typeof GameCodeSlugs)[keyof typeof GameCodeSlugs];
