export const GameCodes = {
  SHAPE_ROTATION: 'SHAPE_ROTATION',
  RPS: 'RPS',
  N_BACK: 'N_BACK',
  NUMBER_PRESSING: 'NUMBER_PRESSING',
  COUNT_COMPARISON: 'COUNT_COMPARISON',
  CAT_CHASER: 'CAT_CHASER',
} as const;

export const GameCodeSlugs = {
  [GameCodes.SHAPE_ROTATION]: 'shape-rotation',
  [GameCodes.RPS]: 'rps',
  [GameCodes.N_BACK]: 'n-back',
  [GameCodes.NUMBER_PRESSING]: 'number-pressing',
  [GameCodes.COUNT_COMPARISON]: 'count-comparison',
  [GameCodes.CAT_CHASER]: 'cat-chaser',
} as const;

export const GameCodeNames = {
  [GameCodes.SHAPE_ROTATION]: 'Shape Rotation',
  [GameCodes.RPS]: 'Rock-Paper-Scissors',
  [GameCodes.N_BACK]: 'N-Back',
  [GameCodes.NUMBER_PRESSING]: 'Number Pressing',
  [GameCodes.COUNT_COMPARISON]: 'Count Comparison',
  [GameCodes.CAT_CHASER]: '고양이 술래잡기',
} as const;

export type GameCode = (typeof GameCodes)[keyof typeof GameCodes];

export type GameCodeSlug = (typeof GameCodeSlugs)[keyof typeof GameCodeSlugs];



export const SlugToGameCode: { [key in GameCodeSlug]: GameCode } = {

  'shape-rotation': GameCodes.SHAPE_ROTATION,

  'rps': GameCodes.RPS,

  'n-back': GameCodes.N_BACK,

  'number-pressing': GameCodes.NUMBER_PRESSING,
  'count-comparison': GameCodes.COUNT_COMPARISON,
  'cat-chaser': GameCodes.CAT_CHASER,

};
