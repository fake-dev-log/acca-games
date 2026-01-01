import { FC } from "react";
import { GamePage } from '@components/layout/GamePage';
import { useCatChaserStore } from '@features/cat-chaser/stores/useCatChaserStore';
import { CatChaserGameSetup } from '@features/cat-chaser/components/CatChaserGameSetup';
import { CatChaserGame } from '@features/cat-chaser/components/CatChaserGame';
import { GameEndPage } from '@features/common/components/GameEndPage';
import { GameCodeSlugs } from '@constants/gameCodes';

const CatChaserPage: FC = () => {
  const results = useCatChaserStore(state => state.results);
  return (
    <GamePage
      useGameStore={useCatChaserStore}
      SetupComponent={CatChaserGameSetup}
      GameComponent={CatChaserGame}
      GameEndComponent={({ sessionId, onExit }) => <GameEndPage gameCode={GameCodeSlugs.CAT_CHASER} sessionId={sessionId} onExit={onExit} results={results} />}
    />
  );
};

export default CatChaserPage;
