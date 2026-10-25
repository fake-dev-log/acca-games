import { useEffect } from 'react';
import { usePathStore } from '../stores/pathStore';
import { countFences } from '../logic/board';
import { GameLayout } from '@components/layout/GameLayout';
import { Button } from '@components/common/Button';
import { ProgressBar } from '@components/common/ProgressBar';
import { useGameLifecycle } from '@hooks/useGameLifecycle';
import { PathBoard } from './PathBoard';

const SOLVED_MS = 900;

export function PathGame() {
  const {
    gameState, roundIndex, puzzle, board, clicks, attempts, lastCheck, revealed, solved, results,
    clickCell, launch, advance, skip, reveal, endRound, resetGame, setGameMode,
  } = usePathStore();
  const settings = gameState?.settings;
  const round = settings?.rounds[roundIndex];

  const { remainingTime, progress, start } = useGameLifecycle({
    onTimeUp: endRound,
    timeLimit: (settings?.timeLimitSec ?? 0) * 1000,
  });

  // 라운드마다 타이머를 새로 건다
  useEffect(() => {
    if (settings) start();
  }, [roundIndex, settings, start]);

  // 성공하면 경로를 잠깐 보여 주고 다음 문제로
  useEffect(() => {
    if (!solved) return;
    const timer = setTimeout(advance, SOLVED_MS);
    return () => clearTimeout(timer);
  }, [solved, advance]);

  useEffect(() => {
    if (!gameState) setGameMode('setup');
  }, [gameState, setGameMode]);

  if (!puzzle || !settings || round === undefined) return null;

  const solvedInRound = results.filter((r) => r.round === round && r.isCorrect).length;
  const failed = lastCheck && !lastCheck.success && !revealed;

  return (
    <GameLayout onExit={resetGame}>
      <div className="w-full max-w-5xl flex flex-col items-center gap-4">
        <div className="w-full flex justify-between items-center font-mono text-lg">
          <span>{round}라운드 · {puzzle.size}×{puzzle.size} · 해결 {solvedInRound}문제</span>
          <span>남은 시간 {Math.ceil(remainingTime / 1000)}초</span>
        </div>
        <ProgressBar progress={progress} />

        <div className="flex flex-col lg:flex-row gap-8 items-center w-full justify-center">
          <PathBoard size={puzzle.size} board={board} vehicles={puzzle.vehicles} traces={lastCheck?.traces} onCellClick={clickCell} />

          <div className="flex flex-col gap-4 w-72">
            <p className="text-sm opacity-80">모든 차가 같은 색 손님에게 가도록 칸을 눌러 울타리를 놓으세요. 누를 때마다 / → \ → 빈칸.</p>
            <div className="text-xl space-y-1">
              <p>정답 울타리 수: <b>{puzzle.minFences}개</b></p>
              <p className="text-base">놓은 울타리 {countFences(board)}개 · 클릭 {clicks}번 · 출발 {attempts}번</p>
            </div>
            <div className="h-8 text-lg font-bold">
              {solved && <span className="text-success">성공!</span>}
              {failed && <span className="text-danger">도착하지 못한 차가 있습니다(점선)</span>}
              {revealed && <span>최소 울타리 정답입니다</span>}
            </div>
            {revealed ? (
              <Button onClick={skip}>다음 문제</Button>
            ) : (
              <>
                <Button onClick={launch} disabled={solved}>출발</Button>
                <Button onClick={skip} variant="secondary" disabled={solved}>건너뛰기</Button>
                {!settings.isRealMode && (
                  <Button onClick={reveal} variant="secondary" disabled={solved}>정답 보기</Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
