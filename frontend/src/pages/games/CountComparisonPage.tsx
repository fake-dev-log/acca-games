import { FC } from 'react';
import { GamePage } from '@components/layout/GamePage';
import { useCountComparisonStore } from '@features/count-comparison/stores/countComparisonStore';
import CountComparisonGameSetup from '@features/count-comparison/components/CountComparisonGameSetup';
import CountComparisonGame from '@features/count-comparison/components/CountComparisonGame';
import { GameEndPage } from '@features/common/components/GameEndPage';
import { GameCodeSlugs } from '@constants/gameCodes';

const CountComparisonPage: FC = () => {
  return (
    <GamePage
      useGameStore={useCountComparisonStore}
      SetupComponent={CountComparisonGameSetup}
      GameComponent={CountComparisonGame}
      GameEndComponent={({ sessionId, onExit }) => (
        <GameEndPage
          gameCode={GameCodeSlugs.COUNT_COMPARISON}
          sessionId={sessionId}
          onExit={onExit}
        />
      )}
    />
  );
};

export default CountComparisonPage;
