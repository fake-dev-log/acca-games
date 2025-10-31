import { useState, useEffect, useCallback, useRef, ComponentType } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { games, types } from '@wails/go/models';
import { SubmitNBackAnswer } from '@wails/go/main/App';
import { Circle } from '@components/shapes/nback/Circle';
import { Square } from '@components/shapes/nback/Square';
import { Triangle } from '@components/shapes/nback/Triangle';
import { Trapezoid } from '@components/shapes/nback/Trapezoid';
import { Hourglass } from '@components/shapes/nback/Hourglass';
import { Diamond } from '@components/shapes/nback/Diamond';
import { Rhombus } from '@components/shapes/nback/Rhombus';
import { Butterfly } from '@components/shapes/nback/Butterfly';
import { Star } from '@components/shapes/nback/Star';
import { Check } from '@components/shapes/nback/Check';
import { Horns } from '@components/shapes/nback/Horns';
import { Pyramid } from '@components/shapes/nback/Pyramid';
import { DoubleTriangle } from '@components/shapes/nback/DoubleTriangle';
import { XShape } from '@components/shapes/nback/XShape';
import { Crown } from '@components/shapes/nback/Crown';
import { PrimaryButton } from '@components/common/PrimaryButton';

const shapeMap: { [key: string]: ComponentType } = {
  circle: Circle,
  square: Square,
  triangle: Triangle,
  trapezoid: Trapezoid,
  hourglass: Hourglass,
  diamond: Diamond,
  rhombus: Rhombus,
  butterfly: Butterfly,
  star: Star,
  check: Check,
  horns: Horns,
  pyramid: Pyramid,
  double_triangle: DoubleTriangle,
  x_shape: XShape,
  crown: Crown,
};

export function NBackGame() {
  const location = useLocation();
  const navigate = useNavigate();

  const [gameState, setGameState] = useState<games.NBackGameState | null>(location.state?.gameState);
  
  const [currentTrial, setCurrentTrial] = useState(0);
  const [currentShape, setCurrentShape] = useState<string | null>(null);
  const [isInputAllowed, setIsInputAllowed] = useState(false);
  const [results, setResults] = useState<types.NBackResult[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showStart, setShowStart] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [progress, setProgress] = useState(100);

  const advanceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressAnimatorRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const handleExit = () => {
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    if (progressAnimatorRef.current) cancelAnimationFrame(progressAnimatorRef.current);
    navigate('/games');
  };

  const advanceToNextTrial = useCallback(() => {
    if (progressAnimatorRef.current) cancelAnimationFrame(progressAnimatorRef.current);
    setFeedback(null);
    setCurrentTrial(prev => prev + 1);
  }, []);

  const submitAnswer = useCallback(async (choice: string, responseTime: number, trial: number) => {
    try {
      const result = await SubmitNBackAnswer(choice, responseTime, trial);
      setResults(prev => [...prev, result]);
      if (!gameState?.settings.isRealMode) {
        setFeedback(result.isCorrect ? 'correct' : 'incorrect');
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
      if (!gameState?.settings.isRealMode) {
        setFeedback('incorrect');
      }
    }
  }, [gameState?.settings.isRealMode]);

  // Main Game Loop
  useEffect(() => {
    if (!gameState) {
      navigate('/games/n-back/setup');
      return;
    }
    if (currentTrial >= gameState.settings.numTrials) {
      setIsFinished(true);
      return;
    }

    const requiredBuffer = gameState.settings.nBackLevel === 1 ? 2 : 3;
    const isTrialActive = currentTrial >= requiredBuffer;

    if (currentTrial === requiredBuffer && !gameState.settings.isRealMode) {
      setShowStart(true);
      setTimeout(() => setShowStart(false), 1500);
    }

    setCurrentShape(gameState.shapeSequence[currentTrial]);
    startTimeRef.current = Date.now();
    setProgress(100);
    setIsInputAllowed(isTrialActive);

    advanceTimerRef.current = setTimeout(async () => {
      setIsInputAllowed(false);
      if (isTrialActive) {
        await submitAnswer('MISS', gameState.settings.presentationTime, currentTrial);
      }
      setCurrentShape(null);
      feedbackTimerRef.current = setTimeout(advanceToNextTrial, 200);
    }, gameState.settings.presentationTime);

    return () => {
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, [currentTrial, gameState, navigate, submitAnswer, advanceToNextTrial]);

  // Progress Bar Animator
  useEffect(() => {
    if (!currentShape || !gameState) return;
    const animate = () => {
      const elapsedTime = Date.now() - startTimeRef.current;
      const newProgress = 100 - (elapsedTime / gameState.settings.presentationTime) * 100;
      if (newProgress > 0) {
        setProgress(newProgress);
        progressAnimatorRef.current = requestAnimationFrame(animate);
      } else {
        setProgress(0);
      }
    };
    progressAnimatorRef.current = requestAnimationFrame(animate);
    return () => {
      if (progressAnimatorRef.current) cancelAnimationFrame(progressAnimatorRef.current);
    };
  }, [currentShape, gameState]);

  const handleKeyPress = useCallback(async (e: KeyboardEvent) => {
    if (!isInputAllowed || !['ArrowLeft', 'ArrowRight', ' '].includes(e.key)) return;

    setIsInputAllowed(false);
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    if (progressAnimatorRef.current) cancelAnimationFrame(progressAnimatorRef.current);

    const responseTime = Date.now() - startTimeRef.current;
    const choice = e.key === ' ' ? 'SPACE' : e.key === 'ArrowLeft' ? 'LEFT' : 'RIGHT';

    await submitAnswer(choice, responseTime, currentTrial);
    
    setCurrentShape(null);
    feedbackTimerRef.current = setTimeout(advanceToNextTrial, 400);

  }, [isInputAllowed, submitAnswer, advanceToNextTrial, currentTrial]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const renderShape = () => {
    if (!currentShape) return <div className="w-48 h-48" />;
    const ShapeComponent = shapeMap[currentShape];
    return ShapeComponent ? <div className="w-48 h-48"><ShapeComponent /></div> : null;
  };
  
  if (!gameState) return <div>Loading...</div>;

  if (isFinished) {
      const correctCount = results.filter(r => r.isCorrect).length;
      const accuracy = results.length > 0 ? (correctCount / results.length) * 100 : 0;

      return (
          <div className="flex flex-col m-auto text-center">
              <h1 className="text-2xl font-bold">게임 종료!</h1>
              <p className="text-xl mt-4">정확도: {accuracy.toFixed(2)}%</p>
              <div className="mt-6 flex flex-col items-center space-y-2">
                <PrimaryButton onClick={() => navigate('/games/n-back/setup')} className="w-48">
                    다시하기
                </PrimaryButton>
              </div>
          </div>
      )
  }

  const Instructions = () => {
    if (!gameState) return null;
    const level = gameState.settings.nBackLevel;
    if (level === 1) {
      return <p>2칸 앞 도형과 같으면 <kbd>←</kbd>, 다르면 <kbd>Space</kbd></p>;
    }
    return <p>2칸 앞과 같으면 <kbd>←</kbd>, 3칸 앞과 같으면 <kbd>→</kbd>, 모두 다르면 <kbd>Space</kbd></p>;
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark relative p-4">
      <button onClick={handleExit} className="absolute top-4 right-4 px-4 py-2 bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark rounded-md hover:bg-primary-light dark:hover:bg-primary-dark hover:text-text-light dark:hover:text-text-dark z-20">
        나가기
      </button>
      <div className="w-80">
        <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center text-text-light dark:text-text-dark text-lg">
          <Instructions />
        </div>
        <div className="w-full bg-surface-light dark:bg-surface-dark rounded-full h-2.5 my-4">
          <div className="bg-primary-light dark:bg-primary-dark h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="w-80 h-80 border-2 border-gray-300 bg-surface-light dark:bg-surface-dark flex items-center justify-center relative shadow-lg rounded-md">
          {showStart && <div className="absolute text-6xl text-primary-light dark:text-primary-dark font-bold animate-pulse">START</div>}
          {renderShape()}
          {feedback === 'correct' && <div className="absolute text-6xl text-success">✓</div>}
          {feedback === 'incorrect' && <div className="absolute text-6xl text-danger">✗</div>}
        </div>
        <div className="mt-4 text-xl font-mono text-center">
          <p>진행: {Math.min(currentTrial + 1, gameState.settings.numTrials)} / {gameState.settings.numTrials}</p>
        </div>
      </div>
    </div>
  );
}
