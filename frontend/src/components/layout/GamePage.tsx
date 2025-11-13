import { ComponentType, FC, useEffect } from 'react';
import { StoreApi, UseBoundStore } from 'zustand';
import { GameMode } from "@constants/gameModes";

interface GameStoreState {
  gameMode: GameMode;
  sessionId: number | null;
  resetGame: () => void;
}

interface GamePageProps {
  useGameStore: UseBoundStore<StoreApi<GameStoreState>>;
  SetupComponent: ComponentType;
  GameComponent: ComponentType;
  GameEndComponent: ComponentType<{ sessionId: number, onExit: () => void }>;
}

export const GamePage: FC<GamePageProps> = ({
  useGameStore, 
  SetupComponent, 
  GameComponent, 
  GameEndComponent 
}) => {
  const gameMode = useGameStore((state) => state.gameMode);
  const sessionId = useGameStore((state) => state.sessionId);
  const resetGame = useGameStore((state) => state.resetGame);

  useEffect(() => {
    // Reset the game state when the user navigates away from the page.
    return () => {
      resetGame();
    };
  }, [resetGame]);

  switch (gameMode) {
    case 'loading':
      return <div className="flex items-center justify-center h-screen">문제 생성 중...</div>;
    case 'playing':
      return <GameComponent />;
    case 'result':
      if (!sessionId) return <div>오류: 세션 ID를 찾을 수 없습니다.</div>;
      return <GameEndComponent sessionId={sessionId} onExit={resetGame} />;
    case 'setup':
    default:
      return <SetupComponent />;
  }
};
