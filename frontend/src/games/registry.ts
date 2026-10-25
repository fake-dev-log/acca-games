import { GameDefinition } from './types';
import { rpsGame } from '@features/rps/definition';
import { shapeRotationGame } from '@features/shape-rotation/definition';
import { numberPressingGame } from '@features/number-pressing/definition';
import { nBackGame } from '@features/n-back/definition';
import { countComparisonGame } from '@features/count-comparison/definition';
import { catChaserGame } from '@features/cat-chaser/definition';
import { appointmentGame } from '@features/appointment/definition';
import { potionGame } from '@features/potion/definition';
import { pathGame } from '@features/path/definition';

// 게임 선택·기록 화면에 나오는 순서
export const GAMES: GameDefinition[] = [
  rpsGame,
  shapeRotationGame,
  numberPressingGame,
  nBackGame,
  countComparisonGame,
  catChaserGame,
  appointmentGame,
  pathGame,
  potionGame,
];

export const findGameBySlug = (slug: string | undefined): GameDefinition | undefined =>
  GAMES.find((game) => game.slug === slug);
