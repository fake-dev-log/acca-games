import { FC, useEffect } from 'react';
import { GameDefinition } from '@games/types';
import { GameEndPage } from '@features/common/components/GameEndPage';

export const GamePage: FC<{ game: GameDefinition }> = ({ game }) => {
  const gameMode = game.useStore((state) => state.gameMode);
  const resetGame = game.useStore((state) => state.resetGame);

  // 들어올 때와 나갈 때 모두 초기화 — 이전 판의 결과 화면이 남지 않게
  useEffect(() => {
    resetGame();
    return () => resetGame();
  }, [resetGame]);

  const { Setup, Game } = game;
  switch (gameMode) {
    case 'loading':
      return <div className="flex items-center justify-center h-screen">문제 생성 중...</div>;
    case 'playing':
      return <Game />;
    case 'result':
      return <GameEndPage game={game} />;
    case 'setup':
    default:
      return <Setup />;
  }
};
