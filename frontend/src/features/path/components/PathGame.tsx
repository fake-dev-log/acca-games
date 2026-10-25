import { useEffect, useState } from 'react';
import { usePathStore } from '../stores/pathStore';
import { countFences } from '../logic/board';
import { MAX_CLICKS } from '../logic/PathEngine';
import { VEHICLE_INFO } from '../logic/generator';
import { GameLayout } from '@components/layout/GameLayout';
import { Button } from '@components/common/Button';
import { useGameLifecycle } from '@hooks/useGameLifecycle';
import { PathBoard } from './PathBoard';

const AUTO_NEXT_MS = 700;

const formatClock = (ms: number) => {
  const sec = Math.ceil(ms / 1000);
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
};

export function PathGame() {
  const {
    gameState, index, puzzle, board, clicks, submitted,
    toggleAt, setCell, submit, next, finish, resetGame, setGameMode,
  } = usePathStore();
  const [inputMode, setInputMode] = useState<'pointer' | 'choose'>('pointer');
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const settings = gameState?.settings;

  const { remainingTime, start } = useGameLifecycle({
    onTimeUp: finish,
    timeLimit: (settings?.timeLimitSec ?? 0) * 1000,
  });

  useEffect(() => {
    if (settings) start();
  }, [settings, start]);

  useEffect(() => setSelected(null), [index]);

  // 완벽하게 푼 문제와 실전 모드는 바로 다음 문제로. 연습에서 틀리거나 초과한 문제는 '다음 문제'를 눌러야 넘어간다.
  const autoNext = !!submitted && (submitted.verdict === 'perfect' || !!settings?.isRealMode);
  useEffect(() => {
    if (!autoNext) return;
    const timer = setTimeout(next, AUTO_NEXT_MS);
    return () => clearTimeout(timer);
  }, [autoNext, next]);

  useEffect(() => {
    if (!gameState) setGameMode('setup');
  }, [gameState, setGameMode]);

  if (!puzzle || !settings) return null;

  const real = settings.isRealMode;
  const showReview = !!submitted && !real && submitted.verdict !== 'perfect';
  const fences = countFences(board);

  return (
    <GameLayout onExit={resetGame}>
      <div className="w-full max-w-5xl flex flex-col items-center gap-4 overflow-y-auto max-h-full py-10">
        <div className="flex items-center gap-6">
          <div className="grid grid-cols-4 rounded-lg border border-border-light dark:border-border-dark text-center">
            {[['클릭 가능', MAX_CLICKS - clicks], ['정답 울타리', puzzle.minFences], ['설치됨', fences], ['문제', `${index + 1}/${settings.problemCount}`]]
              .map(([label, value]) => (
                <div key={label} className="px-4 py-1 border-r last:border-r-0 border-border-light dark:border-border-dark">
                  <p className="text-xs opacity-70">{label}</p>
                  <p className="text-xl font-bold font-mono">{value}</p>
                </div>
              ))}
          </div>
          <span className="text-2xl font-mono font-bold">{settings.timeLimitSec ? formatClock(remainingTime) : '∞'}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center w-full">
          <div className="flex flex-col items-center gap-3 w-full max-w-[440px]">
            <PathBoard size={puzzle.size} board={board} walls={puzzle.walls} vehicles={puzzle.vehicles}
              traces={submitted && !real ? submitted.traces : null}
              input={submitted ? undefined : inputMode === 'pointer'
                ? { mode: 'pointer', onPlace: toggleAt }
                : { mode: 'choose', selected, onSelect: (r, c) => setSelected([r, c]) }} />

            {inputMode === 'choose' && !submitted && (
              <div className="flex gap-3">
                {(['/', '\\'] as const).map((fence) => (
                  <Button key={fence} variant="secondary" className="px-6!" disabled={!selected}
                    onClick={() => selected && setCell(selected[0], selected[1], fence)}>{fence}</Button>
                ))}
                <Button variant="secondary" className="px-6!" disabled={!selected}
                  onClick={() => selected && setCell(selected[0], selected[1], null)}>지우기</Button>
              </div>
            )}
            {clicks >= MAX_CLICKS && !submitted && <p className="text-danger font-bold">클릭을 모두 썼습니다 — 제출하세요</p>}

            {!submitted && <Button onClick={submit} className="w-full">제출</Button>}
            {submitted && !autoNext && <Button onClick={next} className="w-full">다음 문제</Button>}
            <div className="h-8 text-lg font-bold">
              {submitted && !real && submitted.verdict === 'perfect' && <span className="text-success">완벽해요!</span>}
              {showReview && submitted!.verdict === 'excess' && <span className="text-warning">도착은 했지만 울타리를 {fences - puzzle.minFences}개 더 놓았어요 (초과 설치)</span>}
              {showReview && submitted!.verdict === 'wrong' && <span className="text-danger">짝 손님에게 가지 못한 교통수단이 있어요 (점선)</span>}
            </div>
          </div>

          <div className="flex flex-col gap-4 w-72">
            {showReview ? (
              <div className="text-center">
                <p className="mb-2 font-bold">정답 예시 (울타리 {puzzle.minFences}개)</p>
                <PathBoard compact size={puzzle.size} board={puzzle.solution} walls={puzzle.walls} vehicles={puzzle.vehicles} />
              </div>
            ) : (
              <>
                <p className="text-sm opacity-80">교통수단을 같은 색 짝 손님에게 보내도록 칸에 울타리를 놓으세요. 차는 직진하다가 울타리를 만나면 90° 꺾입니다.
                  칸의 어느 대각선 쪽을 누르느냐로 방향이 정해지고, 다시 누르면 치웁니다. 클릭은 문제당 {MAX_CLICKS}번까지.</p>
                <ul className="text-sm space-y-1">
                  {Object.values(VEHICLE_INFO).map((info) => (
                    <li key={info.label}>{info.vehicle} → {info.customer} {info.label}</li>
                  ))}
                </ul>
              </>
            )}
            {!submitted && (
              <Button variant="secondary" className="text-sm! py-2!"
                onClick={() => { setInputMode(inputMode === 'pointer' ? 'choose' : 'pointer'); setSelected(null); }}>
                {inputMode === 'pointer' ? '울타리 방향이 뜻대로 안 되나요? 칸 누르고 방향 고르기' : '누른 위치로 놓기로 돌아가기'}
              </Button>
            )}
            {!real && <Button variant="secondary" className="text-sm! py-2!" onClick={finish}>그만하고 결과 보기</Button>}
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
