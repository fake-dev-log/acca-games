import { FC, useEffect } from "react";
import { GamePage } from '@components/layout/GamePage';
import useShapeRotationStore from '@features/shape-rotation/stores/shapeRotationStore';
import ShapeRotationGameSetup from '@features/shape-rotation/components/ShapeRotationGameSetup';
import ShapeRotationGame from '@features/shape-rotation/components/ShapeRotationGame';
import { GameEndPage } from '@features/common/components/GameEndPage';
import { GameCodeSlugs } from '@constants/gameCodes';

const ShapeRotationPage: FC = () => {
  const results = useShapeRotationStore(state => state.results);
  const resetGame = useShapeRotationStore(state => state.resetGame);

  // Reset game state when entering the page (e.g. from 'Retry' or main menu)
  useEffect(() => {
    resetGame();
  }, [resetGame]);

  return (
    <GamePage
      useGameStore={useShapeRotationStore}
      SetupComponent={ShapeRotationGameSetup}
      GameComponent={ShapeRotationGame}
      GameEndComponent={({ sessionId, onExit }) => <GameEndPage gameCode={GameCodeSlugs.SHAPE_ROTATION} sessionId={sessionId} onExit={onExit} results={results} />}
    />
  );
};

export default ShapeRotationPage;
