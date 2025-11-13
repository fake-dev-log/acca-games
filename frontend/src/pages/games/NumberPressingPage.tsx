import { FC } from "react";
import { GamePage } from '@components/layout/GamePage';
import { useNumberPressingStore } from '@features/number-pressing/stores/numberPressingStore';
import { NumberPressingGameSetup } from '@features/number-pressing/components/NumberPressingGameSetup';
import { NumberPressingGame } from '@features/number-pressing/components/NumberPressingGame';
import { GameEndPage } from '@features/common/components/GameEndPage';
import { GameCodeSlugs } from '@constants/gameCodes';

const NumberPressingPage: FC = () => {
  return (
    <GamePage
      useGameStore={useNumberPressingStore}
      SetupComponent={NumberPressingGameSetup}
      GameComponent={NumberPressingGame}
      GameEndComponent={({ sessionId, onExit }) => <GameEndPage gameCode={GameCodeSlugs.NUMBER_PRESSING} sessionId={sessionId} onExit={onExit} />}
    />
  );
};

export default NumberPressingPage;
