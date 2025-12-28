import { FC, useEffect } from "react";
import { GamePage } from '@components/layout/GamePage';
import { useNumberPressingStore } from '@features/number-pressing/stores/numberPressingStore';
import { NumberPressingGameSetup } from '@features/number-pressing/components/NumberPressingGameSetup';
import { NumberPressingGame } from '@features/number-pressing/components/NumberPressingGame';
import { GameEndPage } from '@features/common/components/GameEndPage';
import { GameCodeSlugs } from '@constants/gameCodes';

const NumberPressingPage: FC = () => {
  const results = useNumberPressingStore(state => state.results);
  const resetGame = useNumberPressingStore(state => state.resetGame);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  const combinedResults = [...results.resultsR1, ...results.resultsR2];

  return (
    <GamePage
      useGameStore={useNumberPressingStore}
      SetupComponent={NumberPressingGameSetup}
      GameComponent={NumberPressingGame}
      GameEndComponent={({ sessionId, onExit }) => <GameEndPage gameCode={GameCodeSlugs.NUMBER_PRESSING} sessionId={sessionId} onExit={onExit} results={combinedResults} />}
    />
  );
};

export default NumberPressingPage;