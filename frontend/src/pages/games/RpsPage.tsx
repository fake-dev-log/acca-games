import { FC } from "react";
import { GamePage } from '@components/layout/GamePage';
import { useRpsStore } from '@features/rps/stores/rpsStore';
import { RpsGameSetup } from '@features/rps/components/RpsGameSetup';
import { RpsGame } from '@features/rps/components/RpsGame';
import { GameEndPage } from '@features/common/components/GameEndPage';
import { GameCodeSlugs } from '@constants/gameCodes';

const RpsPage: FC = () => {
  return (
    <GamePage
      useGameStore={useRpsStore}
      SetupComponent={RpsGameSetup}
      GameComponent={RpsGame}
      GameEndComponent={({ sessionId, onExit }) => <GameEndPage gameCode={GameCodeSlugs.RPS} sessionId={sessionId} onExit={onExit} />}
    />
  );
};

export default RpsPage;
