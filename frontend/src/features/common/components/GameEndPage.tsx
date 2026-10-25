import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameLayout } from '@components/layout/GameLayout';
import { Button } from '@components/common/Button';
import { GameDefinition } from '@games/types';
import { recordStore } from '@records/recordStore';

type SaveState = 'saving' | 'saved' | 'failed' | 'skipped';

export const GameEndPage: FC<{ game: GameDefinition }> = ({ game }) => {
  const navigate = useNavigate();
  // 결과 화면에 들어온 순간의 스토어 상태를 한 번만 읽는다(이후 상태가 바뀌어도 이 판의 결과를 보여 준다)
  const [snapshot] = useState(() => {
    const state = game.useStore.getState();
    return { sessionId: state.sessionId, ...game.selectRecord(state) };
  });
  const [saveState, setSaveState] = useState<SaveState>('saving');
  const [showDetail, setShowDetail] = useState(false);

  const { sessionId, settings, results } = snapshot;

  useEffect(() => {
    if (sessionId === null || results.length === 0) {
      setSaveState('skipped');
      return;
    }
    let cancelled = false;
    // id 가 세션 시작 시각이라 StrictMode 에서 두 번 불려도 한 건으로 덮인다
    recordStore
      .save({ id: sessionId, gameCode: game.code, playedAt: new Date(sessionId).toISOString(), settings, results })
      .then(() => !cancelled && setSaveState('saved'))
      .catch((err) => {
        console.error('Failed to save record:', err);
        if (!cancelled) setSaveState('failed');
      });
    return () => {
      cancelled = true;
    };
  }, [game.code, sessionId, settings, results]);

  const accuracy = game.metrics(results).accuracy ?? 0;
  const { ResultDetail } = game;
  const resetGame = game.useStore.getState().resetGame;

  return (
    <GameLayout onExit={() => navigate('/games')}>
      <div className="flex flex-col m-auto text-center w-full max-w-4xl px-4 overflow-y-auto max-h-[90vh] py-8">
        <h1 className="text-3xl font-bold">게임 종료!</h1>
        {results.length === 0 ? (
          <p className="text-xl mt-4">기록된 결과가 없습니다.</p>
        ) : (
          <div className="flex flex-col items-center w-full">
            <p className="text-xl mt-4">정답률: {accuracy.toFixed(1)}%</p>
            <p className="text-sm mt-1 mb-6 opacity-70">
              {saveState === 'saving' && '기록 저장 중...'}
              {saveState === 'saved' && '기록에 저장했습니다.'}
              {saveState === 'failed' && '기록을 저장하지 못했습니다. 이 브라우저의 저장소 설정을 확인해 주세요.'}
            </p>
            {showDetail && <ResultDetail results={results} />}
          </div>
        )}
        <div className="mt-6 flex flex-col items-center space-y-2">
          {results.length > 0 && (
            <Button onClick={() => setShowDetail(!showDetail)} className="w-48" variant={showDetail ? 'secondary' : 'primary'}>
              {showDetail ? '상세 닫기' : '결과 상세'}
            </Button>
          )}
          <Button onClick={resetGame} className="w-48">다시하기</Button>
          {saveState === 'saved' && (
            <Button onClick={() => navigate(`/records/${game.slug}/${sessionId}`)} variant="secondary" className="w-48">기록 보기</Button>
          )}
          <Button onClick={() => navigate('/')} variant="secondary" className="w-48">메인으로</Button>
        </div>
      </div>
    </GameLayout>
  );
};
