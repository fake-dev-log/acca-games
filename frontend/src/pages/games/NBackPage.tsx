import { FC } from "react";
import { GamePage } from '@components/layout/GamePage';
import { useNBackStore } from '@features/n-back/stores/nbackStore';
import { NBackGameSetup } from '@features/n-back/components/NBackGameSetup';
import { NBackGame } from '@features/n-back/components/NBackGame';
import { GameEndPage } from '@features/common/components/GameEndPage';
import { GameCodeSlugs } from '@constants/gameCodes';

const NBackPage: FC = () => {
  return (
    <GamePage
      useGameStore={useNBackStore}
      SetupComponent={NBackGameSetup}
      GameComponent={NBackGame}
      GameEndComponent={({ sessionId, onExit }) => <GameEndPage gameCode={GameCodeSlugs.N_BACK} sessionId={sessionId} onExit={onExit} />}
    />
  );
};

export default NBackPage;
