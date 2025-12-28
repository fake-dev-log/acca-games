import { FC, useEffect } from "react";
import { GamePage } from '@components/layout/GamePage';
import { useNBackStore } from '@features/n-back/stores/nbackStore';
import { NBackGameSetup } from '@features/n-back/components/NBackGameSetup';
import { NBackGame } from '@features/n-back/components/NBackGame';
import { GameEndPage } from '@features/common/components/GameEndPage';
import { GameCodeSlugs } from '@constants/gameCodes';

const NBackPage: FC = () => {
  const results = useNBackStore(state => state.results);
  const resetGame = useNBackStore(state => state.resetGame);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  return (
    <GamePage
      useGameStore={useNBackStore}
      SetupComponent={NBackGameSetup}
      GameComponent={NBackGame}
      GameEndComponent={({ sessionId, onExit }) => <GameEndPage gameCode={GameCodeSlugs.N_BACK} sessionId={sessionId} onExit={onExit} results={results} />}
    />
  );
};

export default NBackPage;