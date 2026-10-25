import { useCallback, useEffect, useRef, useState } from 'react';
import { usePotionStore } from '../stores/potionStore';
import { PotionColor, PotionResult } from '../logic/types';
import { GameLayout } from '@components/layout/GameLayout';
import { ProgressBar } from '@components/common/ProgressBar';
import { useGameLifecycle } from '@hooks/useGameLifecycle';
import { comboKey } from '../logic/PotionEngine';
import { IngredientCards, PotionBadge } from './PotionParts';

const OUTCOME_MS = 1000;

export function PotionGame() {
  const { gameState, submitAnswer, setGameMode, resetGame } = usePotionStore();
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState<PotionResult | null>(null); // 결과를 보여 주는 중이면 그 문제의 결과
  const startRef = useRef(0);
  const answeredRef = useRef(false);

  const trials = gameState?.trials ?? [];
  const trial = trials[index];
  const settings = gameState?.settings;

  const answer = useCallback((choice: PotionColor | null) => {
    if (!trial || !settings || answeredRef.current) return;
    answeredRef.current = true;
    const elapsed = choice === null ? settings.responseTimeLimitMs : Date.now() - startRef.current;
    setShown(submitAnswer(trial.trialNum, choice, elapsed));
  }, [trial, settings, submitAnswer]);

  const { progress, start, stop } = useGameLifecycle({
    onTimeUp: () => answer(null),
    timeLimit: settings?.responseTimeLimitMs ?? 0,
  });

  // 새 문제: 타이머 시작
  useEffect(() => {
    if (!trial) return;
    answeredRef.current = false;
    startRef.current = Date.now();
    start();
  }, [trial, start]);

  // 결과 표시 후 다음 문제로
  useEffect(() => {
    if (!shown) return;
    stop();
    const timer = setTimeout(() => {
      setShown(null);
      if (index + 1 >= trials.length) setGameMode('result');
      else setIndex(index + 1);
    }, OUTCOME_MS);
    return () => clearTimeout(timer);
  }, [shown, index, trials.length, stop, setGameMode]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') answer('BLUE');
      if (e.key === 'ArrowRight') answer('RED');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [answer]);

  useEffect(() => {
    if (!gameState) setGameMode('setup');
  }, [gameState, setGameMode]);

  if (!trial || !settings) return null;

  // 연습 모드 표시: 같은 조합이 지난번에 다른 약을 냈는지(플레이어가 직접 본 결과만으로 판단한다)
  const lastTime = [...trials.slice(0, index)].reverse().find((t) => comboKey(t.combo) === comboKey(trial.combo));
  const differsFromLastTime = !!(shown && lastTime && lastTime.outcome !== trial.outcome);

  return (
    <GameLayout onExit={resetGame}>
      <div className="absolute top-4 left-4 font-mono text-lg">{index + 1} / {trials.length}</div>
      <div className="flex flex-col items-center gap-8 w-full max-w-xl">
        <ProgressBar progress={shown ? 0 : progress} />
        <p className="text-xl">이번에 만들어질 가능성이 높은 약은?</p>
        <IngredientCards combo={trial.combo} />

        <div className="h-16 flex flex-col items-center justify-center gap-1">
          {shown && (
            <>
              <p className="text-2xl">만들어진 약: <PotionBadge color={shown.outcome} /></p>
              {shown.playerChoice === null && <p className="text-sm text-danger">시간 초과</p>}
              {!settings.isRealMode && differsFromLastTime && <p className="text-sm font-bold text-warning">같은 조합인데 지난번과 다른 약이 나왔어요</p>}
            </>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6 w-full">
          <button type="button" onClick={() => answer('BLUE')} disabled={!!shown}
            className="py-6 rounded-lg shadow-md text-white text-xl font-bold bg-[#4F81BD] hover:opacity-90 disabled:opacity-60">← 파란 약</button>
          <button type="button" onClick={() => answer('RED')} disabled={!!shown}
            className="py-6 rounded-lg shadow-md text-white text-xl font-bold bg-[#C0504D] hover:opacity-90 disabled:opacity-60">빨간 약 →</button>
        </div>
      </div>
    </GameLayout>
  );
}
