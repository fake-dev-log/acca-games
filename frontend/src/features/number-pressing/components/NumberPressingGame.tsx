import { useState, useEffect, useCallback, useRef, useMemo, FC } from 'react';
import { useNumberPressingStore } from '../stores/numberPressingStore';
import { types } from '@wails/go/models';
import { GameLayout } from '@components/layout/GameLayout';
import { ProgressBar } from '@components/common/ProgressBar';
import { Card } from '@components/common/Card';
import { CalculateCorrectClicksR2 } from '@wails/go/main/App';

// --- Helper Components ---
interface NumberButtonProps {
  number: number;
  onClick: (number: number) => void;
  disabled: boolean;
  isTarget?: boolean;
}

const NumberButton: FC<NumberButtonProps> = ({ number, onClick, disabled, isTarget }) => {
  const baseClasses = "w-24 h-24 text-3xl font-bold rounded-lg flex items-center justify-center border-4";
  const activeClasses = "bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark border-[var(--color-surface-light)] dark:border-[var(--color-surface-dark)] hover:bg-primary-light/20 dark:hover:bg-primary-dark/20 cursor-pointer";
  const disabledClasses = "bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-transparent cursor-not-allowed";
  const targetClasses = "border-primary-light dark:border-primary-dark shadow-lg";

  let buttonClasses = disabled ? disabledClasses : activeClasses;
  if (isTarget) {
    buttonClasses += ` ${targetClasses}`;
  }

  return (
    <button onClick={() => !disabled && onClick(number)} disabled={disabled} className={`${baseClasses} ${buttonClasses}`}>
      {number}
    </button>
  );
};

// --- Main Game Component ---
export function NumberPressingGame() {
  const {
    gameState,
    gameMode,
    resetGame,
    setGameMode,
    submitAnswerR1,
    submitAnswerR2,
  } = useNumberPressingStore();

  const [status, setStatus] = useState('ready'); // ready, playing, feedback, round-end, finished
  const [currentRound, setCurrentRound] = useState<number | null>(null);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

  // Round 2 specific state
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [correctSequence, setCorrectSequence] = useState<number[]>([]);
  const [shuffledNumbers, setShuffledNumbers] = useState<number[]>([]);

  const roundStartTimeRef = useRef<number>(0);
  const problemStartTimeRef = useRef<number>(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const timeLimit = useMemo(() => {
    if (!gameState || currentRound === null) return 0;
    return currentRound === 1 ? gameState.setup.timeLimitR1 * 1000 : gameState.setup.timeLimitR2 * 1000;
  }, [currentRound, gameState]);

  const handleTimeout = useCallback(() => {
    setStatus('round-end');
  }, []);

  const [elapsedTime, setElapsedTime] = useState(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRoundTimer = useCallback(() => {
    roundStartTimeRef.current = Date.now();
    timerIntervalRef.current = setInterval(() => {
      setElapsedTime(Date.now() - roundStartTimeRef.current);
    }, 100);
  }, []);

  const stopRoundTimer = useCallback(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  }, []);

  const resetRoundTimer = useCallback(() => {
    stopRoundTimer();
    setElapsedTime(0);
    roundStartTimeRef.current = 0;
  }, [stopRoundTimer]);

  useEffect(() => {
    if (elapsedTime >= timeLimit && timeLimit > 0) {
      handleTimeout();
    }
  }, [elapsedTime, timeLimit, handleTimeout]);

  const roundTimeLeft = timeLimit - elapsedTime;

  const currentProblemsR1 = useMemo(() => gameState?.problemsR1 || [], [gameState]);
  const currentProblemR1 = useMemo(() => currentProblemsR1[currentProblemIndex], [currentProblemsR1, currentProblemIndex]);

  const currentProblemsR2 = useMemo(() => gameState?.problemsR2 || [], [gameState]);
  const currentProblemR2 = useMemo(() => currentProblemsR2[currentProblemIndex], [currentProblemsR2, currentProblemIndex]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    stopRoundTimer();
  }, [stopRoundTimer]);

  const handleExit = useCallback(() => {
    clearTimers();
    resetGame();
  }, [clearTimers, resetGame]);

  const advanceToNextProblem = useCallback(() => {
    const problemsInRound = currentRound === 1 ? currentProblemsR1.length : currentProblemsR2.length;
    if (currentProblemIndex + 1 < problemsInRound) {
      setCurrentProblemIndex(prev => prev + 1);
      setStatus('playing');
    } else {
      setStatus('round-end');
    }
  }, [currentProblemIndex, currentRound, currentProblemsR1.length, currentProblemsR2.length]);

  const showFeedback = useCallback((isCorrect: boolean) => {
    if (gameState?.setup.isRealMode) {
      const advanceTimer = setTimeout(() => {
        advanceToNextProblem();
      }, 200);
      timersRef.current.push(advanceTimer);
      return;
    }

    setFeedback(isCorrect ? 'correct' : 'incorrect');
    setStatus('feedback');
    const feedbackTimer = setTimeout(() => {
      setFeedback(null);
      advanceToNextProblem();
    }, 800);
    timersRef.current.push(feedbackTimer);
  }, [advanceToNextProblem, gameState?.setup.isRealMode]);

  const handleR1Click = useCallback(async (clickedNumber: number) => {
    if (status !== 'playing' || !currentProblemR1 || currentRound === null) return;

    const timeTaken = (Date.now() - problemStartTimeRef.current) / 1000; // problemStartTimeRef still tracks problem start
    const isCorrect = clickedNumber === currentProblemR1.targetNumber;
    const result = new types.NumberPressingResultR1({
      sessionID: gameState!.id,
      problem: currentProblemR1,
      timeTaken,
      isCorrect,
    });
    await submitAnswerR1(result);
    showFeedback(isCorrect);
  }, [status, currentProblemR1, gameState, showFeedback, currentRound, submitAnswerR1, problemStartTimeRef]);

  const handleR2Click = useCallback(async (clickedNumber: number) => {
    if (status !== 'playing' || !currentProblemR2 || currentRound === null) return;

    const newSequence = [...playerSequence, clickedNumber];
    setPlayerSequence(newSequence);

    const isPartialCorrect = newSequence[newSequence.length - 1] === correctSequence[newSequence.length - 1];

    if (!isPartialCorrect) {
      const timeTaken = (Date.now() - problemStartTimeRef.current) / 1000;
      const result = new types.NumberPressingResultR2({
        sessionID: gameState!.id,
        problem: currentProblemR2,
        playerClicks: newSequence,
        correctClicks: correctSequence,
        timeTaken,
        isCorrect: false,
      });
      await submitAnswerR2(result);
      showFeedback(false);
      return;
    }

    if (newSequence.length === correctSequence.length) {
      const timeTaken = (Date.now() - problemStartTimeRef.current) / 1000;
      const result = new types.NumberPressingResultR2({
        sessionID: gameState!.id,
        problem: currentProblemR2,
        playerClicks: newSequence,
        correctClicks: correctSequence,
        timeTaken,
        isCorrect: true,
      });
      await submitAnswerR2(result);
      showFeedback(true);
    }
  }, [status, playerSequence, correctSequence, currentProblemR2, gameState, showFeedback, currentRound, submitAnswerR2, problemStartTimeRef]);

  useEffect(() => {
    if (!gameState) {
      // If gameState is null, we should always be in setup mode
      if (gameMode !== 'setup') {
        setGameMode('setup');
      }
      return;
    }
    if (currentRound === null && gameState.setup.rounds.length > 0) {
      setCurrentRound(gameState.setup.rounds[0]);
    }

    return () => clearTimers();
  }, [gameState, clearTimers, currentRound, setGameMode, gameMode]);

  useEffect(() => {
    if (status === 'playing') {
      // Only start/reset round timer if it's the first problem of the round
      if (currentProblemIndex === 0) {
        resetRoundTimer();
        startRoundTimer();
      }
      problemStartTimeRef.current = Date.now(); // This still tracks individual problem start time

      if (currentRound === 2 && currentProblemR2) {
        const numbers = Array.from({ length: 9 }, (_, i) => i + 1);
        setShuffledNumbers(numbers.sort(() => Math.random() - 0.5));
        CalculateCorrectClicksR2(currentProblemR2).then(setCorrectSequence);
        setPlayerSequence([]);
      }
    } else if (status === 'round-end') {
      stopRoundTimer(); // Stop the round timer when the round ends
      const currentRoundIndex = gameState?.setup.rounds.indexOf(currentRound!);
      if (currentRoundIndex !== undefined && currentRoundIndex !== -1 &&
          currentRoundIndex + 1 < gameState!.setup.rounds.length) {
        const nextRound = gameState!.setup.rounds[currentRoundIndex + 1];
        const transitionTimer = setTimeout(() => {
          setCurrentRound(nextRound);
          setCurrentProblemIndex(0);
          setStatus('ready');
        }, 2000);
        timersRef.current.push(transitionTimer);
      } else {
        const finishTimer = setTimeout(() => setGameMode('result'), 2000);
        timersRef.current.push(finishTimer);
      }
    } else if (status === 'ready') {
        clearTimers();
        const readyTimer = setTimeout(() => setStatus('playing'), 1500);
        timersRef.current.push(readyTimer);
    }
  }, [status, currentRound, currentProblemIndex, currentProblemR2, gameState, clearTimers, startRoundTimer, resetRoundTimer, setGameMode]);

  if (!gameState) return <div>Loading...</div>;

  const problems = currentRound === 1 ? currentProblemsR1 : currentProblemsR2;
  const progress = (roundTimeLeft / timeLimit) * 100;

  const renderGameContent = () => {
    if (status === 'ready') {
      const message = currentRound === 1
        ? '활성화된 숫자를 누르세요.'
        : '제시되는 조건에 맞게 숫자를 누르세요.';

      return (
        <div className="flex flex-col items-center">
          <Card className="mb-4 p-4 text-center w-full">
            <p className="text-xl font-bold">라운드 {currentRound} 준비</p>
            <p className="text-base mt-1">{message}</p>
          </Card>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <NumberButton
                key={num}
                number={num}
                onClick={currentRound === 1 ? handleR1Click : handleR2Click}
                disabled={true}
              />
            ))}
          </div>
        </div>
      );
    }
    if (status === 'round-end') {
      return <div className="text-4xl font-bold">라운드 {currentRound} 종료</div>;
    }

    if (currentRound === 1) {
      return (
        <div className="flex flex-col items-center">
          <Card className="mb-4 p-4 text-center">
            <p className="text-lg font-semibold">활성화된 숫자를 누르세요.</p>
          </Card>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
              <NumberButton 
                key={num} 
                number={num} 
                onClick={handleR1Click} 
                disabled={status !== 'playing'} 
                isTarget={status === 'playing' && currentProblemR1?.targetNumber === num}
              />
            ))}
          </div>
        </div>
      );
    }

    if (currentRound === 2) {
      return (
        <div className="flex flex-col items-center">
          <Card className="mb-4 p-4 text-center">
            {currentProblemR2 ? (
              <>
                <p className="text-lg font-semibold">두 번 클릭: {currentProblemR2.doubleClick.join(', ') || '없음'}</p>
                <p className="text-lg font-semibold">건너뛰기: {currentProblemR2.skip.join(', ') || '없음'}</p>
              </>
            ) : (
              <p className="text-lg font-semibold">조건 로딩 중...</p>
            )}
          </Card>
          <div className="grid grid-cols-3 gap-4">
            {shuffledNumbers.map(num => (
              <NumberButton key={num} number={num} onClick={handleR2Click} disabled={status !== 'playing'} />
            ))}
          </div>
          <div className="mt-4 h-8 text-lg font-mono tracking-widest">{playerSequence.join(' ')}</div>
        </div>
      );
    }
    return null;
  };

  return (
    <GameLayout onExit={handleExit}>
      <div className="w-full h-full flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold">라운드 {currentRound}</h1>
            {problems.length > 0 && status === 'playing' && <div className="text-lg">문제 {currentProblemIndex + 1} / {problems.length}</div>}
          </div>
          <ProgressBar progress={progress} />
          <div className="text-center my-2">남은 시간: {(roundTimeLeft / 1000).toFixed(1)}초</div>
        </div>

        <div className="flex-grow flex items-center justify-center">
          <div className="relative w-[350px] h-[450px] flex items-center justify-center">
            {feedback && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className={`text-8xl font-bold ${feedback === 'correct' ? 'text-success' : 'text-danger'}`}>
                  {feedback === 'correct' ? '✓' : '✗'}
                </div>
              </div>
            )}
            <div className={`${feedback ? 'opacity-20' : ''}`}>
              {renderGameContent()}
            </div>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}