import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRpsStore } from '@stores/rpsStore';
import { types } from '@wails/go/models';
import { GameLayout } from '@layout/GameLayout';
import { Button } from '@components/common/Button';
import { ProgressBar } from '@components/common/ProgressBar';

// Placeholder components for cards
const Card = ({ children, owner }: { children: React.ReactNode, owner: string }) => (
  <div className="w-40 h-56 border-2 rounded-lg flex flex-col items-center justify-center bg-surface-light dark:bg-surface-dark shadow-lg">
    <div className="text-lg font-bold mb-4">{owner}</div>
    <div className="text-6xl">{children}</div>
  </div>
);

export function RpsGame() {
  const navigate = useNavigate();
  const {
    gameState,
    submitAnswer: submitAnswerToAction,
    resetGameState,
  } = useRpsStore();

  const [currentTrial, setCurrentTrial] = useState(0);
  const [results, setResults] = useState<types.RpsResult[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const advanceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const answeredRef = useRef(false);

  const handleExit = () => {
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    resetGameState();
    navigate('/games');
  };

  const advanceToNextTrial = useCallback(() => {
    setFeedback(null);
    if (gameState && currentTrial + 1 >= gameState.problems.length) {
      setIsFinished(true);
    } else {
      setCurrentTrial(prev => prev + 1);
    }
  }, [currentTrial, gameState]);

  const submitAnswer = useCallback(async (choice: string, responseTime: number) => {
    try {
      const result = await submitAnswerToAction(choice, responseTime, currentTrial);
      if (result) {
        setResults(prev => [...prev, result]);
        setFeedback(result.isCorrect ? 'correct' : 'incorrect');
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
      setFeedback('incorrect');
    }
    feedbackTimerRef.current = setTimeout(advanceToNextTrial, 500);
  }, [currentTrial, submitAnswerToAction, advanceToNextTrial]);

  // Main Game Loop
  useEffect(() => {
    if (!gameState) {
      navigate('/games/rps/setup');
      return;
    }
    if (currentTrial >= gameState.problems.length) {
      setIsFinished(true);
      return;
    }

    answeredRef.current = false;
    startTimeRef.current = Date.now();

    advanceTimerRef.current = setTimeout(async () => {
      if (!answeredRef.current) {
        await submitAnswer('MISS', gameState.settings.timeLimitMs);
      }
    }, gameState.settings.timeLimitMs);

    return () => {
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, [currentTrial, gameState, navigate, submitAnswer]);

  const handleKeyPress = useCallback(async (e: KeyboardEvent) => {
    if (answeredRef.current || !['ArrowLeft', 'ArrowDown', 'ArrowRight'].includes(e.key)) return;
    
    answeredRef.current = true;
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);

    const responseTime = Date.now() - startTimeRef.current;
    const choice = e.key === 'ArrowLeft' ? 'SCISSORS' : e.key === 'ArrowDown' ? 'ROCK' : 'PAPER';

    await submitAnswer(choice, responseTime);
  }, [submitAnswer]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  if (!gameState) return <div>Loading...</div>;

  if (isFinished) {
    const correctCount = results.filter(r => r.isCorrect).length;
    const accuracy = results.length > 0 ? (correctCount / results.length) * 100 : 0;

    return (
      <div className="flex flex-col m-auto text-center">
        <h1 className="text-2xl font-bold">게임 종료!</h1>
        <p className="text-xl mt-4">정확도: {accuracy.toFixed(2)}%</p>
        <div className="mt-6 flex flex-col items-center space-y-2">
          <Button onClick={() => navigate('/games/rps/setup')} className="w-48">
            다시하기
          </Button>
        </div>
      </div>
    );
  }

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
        <ProgressBar key={currentTrial} duration={gameState.settings.timeLimitMs} />
        <div className="flex items-center justify-center space-x-8 my-8">
          <Card owner="나">{cardIcon(meCard)}</Card>
          <div className="text-4xl font-bold">VS</div>
          <Card owner="상대">{cardIcon(opponentCard)}</Card>
        </div>
        <div className="h-20 flex items-center justify-center text-6xl font-bold">
          {feedback === 'correct' && <div className="text-success fade-in-out-0-5s">✓</div>}
          {feedback === 'incorrect' && <div className="text-danger fade-in-out-0-5s">✗</div>}
        </div>
        <div className="mt-4 text-xl font-mono text-center">
          <p>진행: {Math.min(currentTrial + 1, gameState.problems.length)} / {gameState.problems.length}</p>
        </div>
        <div className="mt-4 text-lg text-center text-text-light dark:text-text-dark">
            <p>←: 가위, ↓: 바위, →: 보</p>
        </div>
      </div>
    </GameLayout>
  );
}
