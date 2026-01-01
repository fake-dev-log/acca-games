import { FC, useEffect, useState } from 'react';
import { GameLayout } from '@components/layout/GameLayout';
import { GameEndButtons } from '@components/layout/GameEndButtons';
import { GameCodeSlug, SlugToGameCode } from '@constants/gameCodes';
import { GetSessionResults } from "@wails/go/main/App";

type GameEndPageProps = {
  gameCode: GameCodeSlug;
  sessionId: number;
  onExit: () => void;
};

export const GameEndPage: FC<GameEndPageProps> = ({ gameCode, sessionId, onExit }) => {

  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      const uppercaseGameCode = SlugToGameCode[gameCode];
      GetSessionResults(uppercaseGameCode, sessionId)
        .then((jsonString: string) => {
          const parsedData = JSON.parse(jsonString);
          // Handle the specific structure of Number Pressing results
          if (parsedData && Array.isArray(parsedData.resultsR1) && Array.isArray(parsedData.resultsR2)) {
            setResults([...parsedData.resultsR1, ...parsedData.resultsR2]);
          } else {
            setResults(parsedData);
          }
          setIsLoading(false);
        })
        .catch((err: any) => {
          console.error(err);
          setIsLoading(false);
        });
    }
  }, [sessionId, gameCode]);

  const correctCount = results.filter((r: { isCorrect: boolean }) => r.isCorrect).length;
  const accuracy = results.length > 0 ? (correctCount / results.length) * 100 : 0;

  const renderContent = () => {
    if (isLoading) {
      return <p className="text-xl mt-4">결과를 집계 중입니다...</p>;
    }
    if (results.length === 0) {
      return <p className="text-xl mt-4">기록된 결과가 없습니다.</p>;
    }
    return <p className="text-xl mt-4">정확도: {accuracy.toFixed(2)}%</p>;
  };

  return (
    <GameLayout onExit={onExit}>
      <div className="flex flex-col m-auto text-center">
        <h1 className="text-2xl font-bold">게임 종료!</h1>
        {renderContent()}
        <GameEndButtons gameCode={gameCode} sessionId={sessionId} />
      </div>
    </GameLayout>
  );
};
