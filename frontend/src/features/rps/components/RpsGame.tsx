import { useState, useEffect, useCallback, useRef } from 'react';
import { useRpsStore } from '../stores/rpsStore';
import { GameLayout } from '@components/layout/GameLayout';
import { ProgressBar } from '@components/common/ProgressBar';
import { Card } from '@components/common/Card';

export function RpsGame() {
  const {
    gameState,
    submitAnswer: submitAnswerToAction,
    resetGame,
    setGameMode,
  } = useRpsStore();

  const [currentTrial, setCurrentTrial] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [animateCards, setAnimateCards] = useState(false);
  const [progress, setProgress] = useState(100);

  const advanceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const answeredRef = useRef(false);
  const progressAnimatorRef = useRef<number | null>(null);

  const handleExit = () => {
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    if (progressAnimatorRef.current) cancelAnimationFrame(progressAnimatorRef.current);
    resetGame();
  };

  const advanceToNextTrial = useCallback(() => {
    setFeedback(null);
    if (gameState && currentTrial + 1 >= gameState.problems.length) {
      setGameMode('result');
    } else {
      setCurrentTrial(prev => prev + 1);
    }
  }, [currentTrial, gameState, setGameMode]);

  const submitAnswer = useCallback(async (choice: string, responseTime: number) => {
    try {
      const result = await submitAnswerToAction(choice, responseTime, currentTrial + 1);
      if (result) {
        if (!gameState?.settings.isRealMode) {
          setFeedback(result.isCorrect ? 'correct' : 'incorrect');
        }
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
      if (!gameState?.settings.isRealMode) {
        setFeedback('incorrect');
      }
    }
    feedbackTimerRef.current = setTimeout(advanceToNextTrial, 500);
  }, [currentTrial, submitAnswerToAction, advanceToNextTrial, gameState?.settings.isRealMode]);

  useEffect(() => {
    if (!gameState) {
      setGameMode('setup');
      return;
    }
    if (currentTrial >= gameState.problems.length) {
      setGameMode('result');
      return;
    }

    answeredRef.current = false;
    setAnimateCards(true);

    setProgress(100);
    startTimeRef.current = Date.now();
    if (progressAnimatorRef.current) cancelAnimationFrame(progressAnimatorRef.current);

    const animateProgress = () => {
      const elapsedTime = Date.now() - startTimeRef.current;
      const newProgress = 100 - (elapsedTime / gameState.settings.timeLimitMs) * 100;
      setProgress(Math.max(0, newProgress));
      if (newProgress > 0) {
        progressAnimatorRef.current = requestAnimationFrame(animateProgress);
      }
    };
    progressAnimatorRef.current = requestAnimationFrame(animateProgress);

    advanceTimerRef.current = setTimeout(async () => {
      if (progressAnimatorRef.current) cancelAnimationFrame(progressAnimatorRef.current);
      if (!answeredRef.current) {
        answeredRef.current = true;
        await submitAnswer('MISS', gameState.settings.timeLimitMs);
      }
    }, gameState.settings.timeLimitMs);

    return () => {
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
      if (progressAnimatorRef.current) cancelAnimationFrame(progressAnimatorRef.current);
    };
  }, [currentTrial, gameState, setGameMode, submitAnswer]);

  const handleKeyPress = useCallback(async (e: KeyboardEvent) => {
    if (answeredRef.current || !['ArrowLeft', 'ArrowDown', 'ArrowRight'].includes(e.key)) return;
    
    answeredRef.current = true;
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    if (progressAnimatorRef.current) cancelAnimationFrame(progressAnimatorRef.current);

    const responseTime = Date.now() - startTimeRef.current;
    const choice = e.key === 'ArrowLeft' ? 'SCISSORS' : e.key === 'ArrowDown' ? 'ROCK' : 'PAPER';

    await submitAnswer(choice, responseTime);
  }, [submitAnswer]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  if (!gameState) return <div>Loading...</div>;


  const problem = gameState.problems[currentTrial];
  const cardIcon = (card: string) => {
    if (card === 'ROCK') return '✊';
    if (card === 'PAPER') return '✋';
    if (card === 'SCISSORS') return '✌️';
    return '？';
  };

  const meCard = problem.problemCardHolder === 'me' ? '?' : problem.givenCard;
  const opponentCard = problem.problemCardHolder === 'opponent' ? '?' : problem.givenCard;

  return (
    <GameLayout onExit={handleExit}>
      <div className="w-full flex flex-col items-center">
        <div className="absolute top-6 text-center text-text-light dark:text-text-dark text-lg">
          <p>나는 항상 이겨야 합니다.</p>
        </div>
        <ProgressBar progress={progress} />
        <div className="flex items-center justify-center space-x-8 my-8">
          <Card title="나" bordered className="w-34" isAnimated={animateCards} onAnimationEnd={() => setAnimateCards(false)}>
            <div className="text-6xl h-24 flex items-center justify-center">{cardIcon(meCard)}</div>
          </Card>
          <div className="text-4xl font-bold">VS</div>
          <Card title="상대" bordered className="w-34" isAnimated={animateCards} onAnimationEnd={() => setAnimateCards(false)}>
            <div className="text-6xl h-24 flex items-center justify-center">{cardIcon(opponentCard)}</div>
          </Card>
        </div>
        <div className="h-20 flex items-center justify-center text-6xl font-bold">
          {feedback === 'correct' && <div className="text-success fade-in-out-0-5s">✓</div>}
          {feedback === 'incorrect' && <div className="text-danger fade-in-out-0-5s">✗</div>}
        </div>
        <div className="mt-4 text-xl font-mono text-center">
          <p>진행: {Math.min(currentTrial + 1, gameState.problems.length)} / {gameState.problems.length}</p>
        </div>
        <div className="mt-4 text-lg text-center text-text-light dark:text-text-dark">
          <div className="flex justify-center items-center space-x-4">
            <Card className="p-2 w-24" bordered>
              <div className="text-center">
                <p className="font-bold">←</p>
                <p className="text-2xl">{cardIcon('SCISSORS')}</p>
              </div>
            </Card>
            <Card className="p-2 w-24" bordered>
              <div className="text-center">
                <p className="font-bold">↓</p>
                <p className="text-2xl">{cardIcon('ROCK')}</p>
              </div>
            </Card>
            <Card className="p-2 w-24" bordered>
              <div className="text-center">
                <p className="font-bold">→</p>
                <p className="text-2xl">{cardIcon('PAPER')}</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
