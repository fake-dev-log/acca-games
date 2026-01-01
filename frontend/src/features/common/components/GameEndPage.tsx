import { FC, useEffect, useState } from 'react';
import { GameLayout } from '@components/layout/GameLayout';
import { GameEndButtons } from '@components/layout/GameEndButtons';
import { GameCodeSlug, GameCodeSlugs } from '@constants/gameCodes';
import { RpsResultDetail } from '@features/rps/components/RpsResultDetail';
import { ShapeRotationResultDetail } from '@features/shape-rotation/components/ShapeRotationResultDetail';
import { NBackResultDetail } from '@features/n-back/components/NBackResultDetail';
import { NumberPressingResultDetail } from '@features/number-pressing/components/NumberPressingResultDetail';
import { CountComparisonResultDetail } from '@features/count-comparison/components/CountComparisonResultDetail';
import { CatChaserResultDetail } from '@features/cat-chaser/components/CatChaserResultDetail';
import { Button } from '@components/common/Button';

type GameEndPageProps = {
  gameCode: GameCodeSlug;
  sessionId: number;
  onExit: () => void;
  results?: any[]; // Allow passing results directly
};

export const GameEndPage: FC<GameEndPageProps> = ({ gameCode, sessionId, onExit, results: propResults }) => {

  const [results, setResults] = useState<any[]>(propResults || []);
  const [isLoading, setIsLoading] = useState(!propResults);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    if (propResults) {
      setResults(propResults);
      setIsLoading(false);
      return;
    }
    setIsLoading(false); 
  }, [sessionId, gameCode, propResults]);

  const correctCount = results.filter((r: { isCorrect: boolean }) => r.isCorrect).length;
  const accuracy = results.length > 0 ? (correctCount / results.length) * 100 : 0;

  const renderContent = () => {
    if (isLoading) {
      return <p className="text-xl mt-4">결과를 집계 중입니다...</p>;
    }
    if (results.length === 0) {
      return <p className="text-xl mt-4">기록된 결과가 없습니다.</p>;
    }
    
    return (
      <div className="flex flex-col items-center w-full">
        <p className="text-xl mt-4 mb-6">정확도: {accuracy.toFixed(2)}%</p>
        
        {showDetail && gameCode === GameCodeSlugs.RPS && (
          <RpsResultDetail results={results} />
        )}

        {showDetail && gameCode === GameCodeSlugs.SHAPE_ROTATION && (
          <ShapeRotationResultDetail results={results} />
        )}

        {showDetail && gameCode === GameCodeSlugs.N_BACK && (
          <NBackResultDetail results={results} />
        )}

        {showDetail && gameCode === GameCodeSlugs.NUMBER_PRESSING && (
          <NumberPressingResultDetail results={results} />
        )}

        {showDetail && gameCode === GameCodeSlugs.COUNT_COMPARISON && (
          <CountComparisonResultDetail results={results} />
        )}

        {showDetail && gameCode === GameCodeSlugs.CAT_CHASER && (
          <CatChaserResultDetail results={results} />
        )}

        <div className="mt-6 flex flex-col items-center space-y-2">
          <Button 
            onClick={() => setShowDetail(!showDetail)}
            className="w-48"
            variant={showDetail ? "secondary" : "primary"}
          >
            {showDetail ? '상세 닫기' : '결과 상세'}
          </Button>
          <GameEndButtons gameCode={gameCode} sessionId={sessionId} />
        </div>
      </div>
    );
  };

  return (
    <GameLayout onExit={onExit}>
      <div className="flex flex-col m-auto text-center w-full max-w-4xl px-4 overflow-y-auto max-h-[90vh] py-8">
        <h1 className="text-3xl font-bold">게임 종료!</h1>
        {renderContent()}
      </div>
    </GameLayout>
  );
};
