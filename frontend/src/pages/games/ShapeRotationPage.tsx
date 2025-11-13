import { FC } from "react";
import { GamePage } from '@components/layout/GamePage';
import useShapeRotationStore from '@features/shape-rotation/stores/shapeRotationStore';
import ShapeRotationGameSetup from '@features/shape-rotation/components/ShapeRotationGameSetup';
import ShapeRotationGame from '@features/shape-rotation/components/ShapeRotationGame';
import { GameEndPage } from '@features/common/components/GameEndPage';
import { GameCodeSlugs } from '@constants/gameCodes';

const ShapeRotationPage: FC = () => {
  return (
    <GamePage
      useGameStore={useShapeRotationStore}
      SetupComponent={ShapeRotationGameSetup}
      GameComponent={ShapeRotationGame}
      GameEndComponent={({ sessionId, onExit }) => <GameEndPage gameCode={GameCodeSlugs.SHAPE_ROTATION} sessionId={sessionId} onExit={onExit} />}
    />
  );
};

export default ShapeRotationPage;