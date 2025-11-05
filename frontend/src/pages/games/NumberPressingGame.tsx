import { useState, useEffect, useCallback, useRef, useMemo, FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNumberPressingStore } from '@stores/numberPressingStore';
import { GameLayout } from '@layout/GameLayout';
import { SubmitNumberPressingResultR1, SubmitNumberPressingResultR2, CalculateCorrectClicksR2 } from '@wails/go/main/App';
import { types } from '@wails/go/models';
import { ProgressBar } from '@components/common/ProgressBar';
import { Card } from '@components/common/Card';
import { GameEndButtons } from '@components/layout/GameEndButtons';
import { useTimer } from '@hooks/useTimer';

// --- Helper Components ---
interface NumberButtonProps {
  number: number;
  onClick: (number: number) => void;
  disabled: boolean;
  isTarget?: boolean;
}

const NumberButton: FC<NumberButtonProps> = ({ number, onClick, disabled, isTarget }) => {
  const baseClasses = "w-24 h-24 text-3xl font-bold rounded-lg flex items-center justify-center border-4";
  const activeClasses = "bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark border-transparent hover:bg-primary-light/20 dark:hover:bg-primary-dark/20 cursor-pointer";
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
  const navigate = useNavigate();
  const { gameState, resetGameState } = useNumberPressingStore();

  const [status, setStatus] = useState('ready'); // ready, playing, feedback, round-end, finished
  const [currentRound, setCurrentRound] = useState<number | null>(null);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

  // Round 2 specific state
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [correctSequence, setCorrectSequence] = useState<number[]>([]);
  const [shuffledNumbers, setShuffledNumbers] = useState<number[]>([]);

  const problemStartTimeRef = useRef<number>(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const timeLimit = useMemo(() => {
    if (!gameState || currentRound === null) return 0;
    return currentRound === 1 ? gameState.setup.timeLimitR1 * 1000 : gameState.setup.timeLimitR2 * 1000;
  }, [currentRound, gameState]);

  const handleTimeout = useCallback(() => {
    setStatus('round-end');
  }, []);

  const { elapsedTime, start: startTimer, stop: stopTimer, reset: resetTimer } = useTimer(handleTimeout, timeLimit / 1000);
  const roundTimeLeft = timeLimit - elapsedTime;

  const currentProblemsR1 = useMemo(() => gameState?.problemsR1 || [], [gameState]);
  const currentProblemR1 = useMemo(() => currentProblemsR1[currentProblemIndex], [currentProblemsR1, currentProblemIndex]);

  const currentProblemsR2 = useMemo(() => gameState?.problemsR2 || [], [gameState]);
  const currentProblemR2 = useMemo(() => currentProblemsR2[currentProblemIndex], [currentProblemsR2, currentProblemIndex]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    resetTimer();
  }, [resetTimer]);

  const handleExit = useCallback(() => {
    clearTimers();
    resetGameState();
    navigate('/games');
  }, [clearTimers, resetGameState, navigate]);

  const advanceToNextProblem = useCallback(() => {
    stopTimer();
    const problemsInRound = currentRound === 1 ? currentProblemsR1.length : currentProblemsR2.length;
    if (currentProblemIndex + 1 < problemsInRound) {
      setCurrentProblemIndex(prev => prev + 1);
      setStatus('playing');
    } else {
      setStatus('round-end');
    }
  }, [currentProblemIndex, currentRound, currentProblemsR1.length, currentProblemsR2.length, stopTimer]);

  const showFeedback = useCallback((isCorrect: boolean) => {
    stopTimer();

    if (gameState?.setup.isRealMode) {
      // In real mode, don't show feedback, just advance.
      const advanceTimer = setTimeout(() => {
        advanceToNextProblem();
      }, 200); // Shorter delay without feedback
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
  }, [advanceToNextProblem, stopTimer, gameState?.setup.isRealMode]);

  // --- Game Logic Handlers ---
  const handleR1Click = useCallback(async (clickedNumber: number) => {
    if (status !== 'playing' || !currentProblemR1 || currentRound === null) return;

    const timeTaken = (Date.now() - problemStartTimeRef.current) / 1000;
    const isCorrect = clickedNumber === currentProblemR1.targetNumber;
    const result = new types.NumberPressingResultR1({
      sessionID: gameState!.id,
      problem: currentProblemR1,
      timeTaken,
      isCorrect,
    });
    await SubmitNumberPressingResultR1(result);
    showFeedback(isCorrect);
  }, [status, currentProblemR1, gameState, showFeedback, currentRound]);

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
      await SubmitNumberPressingResultR2(result);
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
      await SubmitNumberPressingResultR2(result);
      showFeedback(true);
    }
  }, [status, playerSequence, correctSequence, currentProblemR2, gameState, showFeedback, currentRound]);

  // --- Main Game Loop & Effects ---
  useEffect(() => {
    if (!gameState) {
      navigate('/games/number-pressing/setup');
      return;
    }
    // Initialize currentRound when gameState is available
    if (currentRound === null && gameState.setup.rounds.length > 0) {
      setCurrentRound(gameState.setup.rounds[0]);
    }

    // Cleanup on unmount
    return () => clearTimers();
  }, [gameState, navigate, clearTimers, currentRound]);

  // Status change handler
  useEffect(() => {
    if (status === 'playing') {
      problemStartTimeRef.current = Date.now();
      if (currentProblemIndex === 0) { // Only reset timer at the start of a new round
        resetTimer();
      }
      startTimer();

      if (currentRound === 2 && currentProblemR2) {
        const numbers = Array.from({ length: 9 }, (_, i) => i + 1);
        setShuffledNumbers(numbers.sort(() => Math.random() - 0.5));
        CalculateCorrectClicksR2(currentProblemR2).then(setCorrectSequence);
        setPlayerSequence([]);
      }
    } else if (status === 'round-end') {
      clearTimers(); // Clear timers when the round is truly over.
      const currentRoundIndex = gameState?.setup.rounds.indexOf(currentRound!);
      if (currentRoundIndex !== undefined && currentRoundIndex !== -1 &&
          currentRoundIndex + 1 < gameState!.setup.rounds.length) {
        // There is a next selected round
        const nextRound = gameState!.setup.rounds[currentRoundIndex + 1];
        const transitionTimer = setTimeout(() => {
          setCurrentRound(nextRound);
          setCurrentProblemIndex(0);
          setStatus('ready');
        }, 2000);
        timersRef.current.push(transitionTimer);
      } else {
        // No more selected rounds
        const finishTimer = setTimeout(() => setStatus('finished'), 2000);
        timersRef.current.push(finishTimer);
      }
    } else if (status === 'ready') {
        clearTimers(); // Clear timers to ensure a clean slate for the new round.
        const readyTimer = setTimeout(() => setStatus('playing'), 1500);
        timersRef.current.push(readyTimer);
    }
  }, [status, currentRound, currentProblemIndex, currentProblemR2, gameState, clearTimers, startTimer, resetTimer]);

  // --- Render Logic ---
  if (!gameState || currentRound === null) return <div>Loading...</div>;

  if (status === 'finished') {
    return (
      <div className="flex flex-col m-auto text-center">
        <h1 className="text-2xl font-bold">게임 종료!</h1>
        <p className="text-xl mt-4">수고하셨습니다.</p>
        <GameEndButtons gameCode="number-pressing" />
      </div>
    );
  }

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

    // Only render buttons if status is playing or feedback
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