import { useState, useEffect, useCallback, useRef, ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import { types } from '@wails/go/models';
import { useNBackStore } from '@stores/nbackStore';
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
import { Button } from '@components/common/Button';
import { ProgressBar } from '@components/common/ProgressBar';
import { GameLayout } from '@layout/GameLayout';
import { Card } from '@components/common/Card';

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
  const navigate = useNavigate();
  const {
    gameState,
    submitAnswer: submitAnswerToAction,
    resetGameState,
  } = useNBackStore();

  const [currentTrial, setCurrentTrial] = useState(0);
  const [currentShape, setCurrentShape] = useState<string | null>(null);
  const [isInputAllowed, setIsInputAllowed] = useState(false);
  const [results, setResults] = useState<types.NBackResult[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showStart, setShowStart] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [animateCard, setAnimateCard] = useState(false);

  const advanceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const answeredRef = useRef(false);
  const showStartTimerRef = useRef<NodeJS.Timeout | null>(null);
  const feedbackClearTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleExit = () => {
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    if (feedbackClearTimerRef.current) clearTimeout(feedbackClearTimerRef.current);
    resetGameState();
    navigate('/games');
  };

  const advanceToNextTrial = useCallback(() => {
    if (feedbackClearTimerRef.current) {
      clearTimeout(feedbackClearTimerRef.current);
    }
    setFeedback(null);
    setCurrentTrial(prev => prev + 1);
  }, []);

  const submitAnswer = useCallback(async (choice: string, responseTime: number, trial: number) => {
    if (feedbackClearTimerRef.current) {
      clearTimeout(feedbackClearTimerRef.current);
    }
    try {
      const result = await submitAnswerToAction(choice, responseTime, trial);
      if (result) {
        setResults(prev => [...prev, result]);
        if (!gameState?.settings.isRealMode) {
          setFeedback(result.isCorrect ? 'correct' : 'incorrect');
          feedbackClearTimerRef.current = setTimeout(() => {
            setFeedback(null);
          }, 1000);
        }
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
      if (!gameState?.settings.isRealMode) {
        setFeedback('incorrect');
        feedbackClearTimerRef.current = setTimeout(() => {
          setFeedback(null);
        }, 1000);
      }
    }
  }, [gameState?.settings.isRealMode, submitAnswerToAction]);

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
      showStartTimerRef.current = setTimeout(() => setShowStart(false), 1500);
    } else {
      setShowStart(false);
    }

    answeredRef.current = false;
    setCurrentShape(gameState.shapeSequence[currentTrial]);
    setAnimateCard(true);
    startTimeRef.current = Date.now();
    setIsInputAllowed(isTrialActive);

    advanceTimerRef.current = setTimeout(async () => {
      setIsInputAllowed(false);
      if (isTrialActive && !answeredRef.current) {
        await submitAnswer('MISS', gameState.settings.presentationTime, currentTrial);
      }
      feedbackTimerRef.current = setTimeout(advanceToNextTrial, 200);
    }, gameState.settings.presentationTime);

    return () => {
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
      if (showStartTimerRef.current) clearTimeout(showStartTimerRef.current);
      if (feedbackClearTimerRef.current) clearTimeout(feedbackClearTimerRef.current);
    };
  }, [currentTrial, gameState, navigate, submitAnswer, advanceToNextTrial]);

  const handleKeyPressCallback = useCallback(async (e: KeyboardEvent) => {
    if (!isInputAllowed || !['ArrowLeft', 'ArrowRight', ' '].includes(e.key)) return;

    setIsInputAllowed(false);
    answeredRef.current = true;

    const responseTime = Date.now() - startTimeRef.current;
    const choice = e.key === ' ' ? 'SPACE' : e.key === 'ArrowLeft' ? 'LEFT' : 'RIGHT';

    await submitAnswer(choice, responseTime, currentTrial);
  }, [isInputAllowed, submitAnswer, currentTrial]);

  const handleKeyPressRef = useRef(handleKeyPressCallback);
  handleKeyPressRef.current = handleKeyPressCallback;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => handleKeyPressRef.current(e);
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
                <Button onClick={() => navigate('/games/n-back/setup')} className="w-48">
                    다시하기
                </Button>
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
    <GameLayout onExit={handleExit}>
      <div className="w-80">
        <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center text-text-light dark:text-text-dark text-lg">
          <Instructions />
        </div>
        <ProgressBar
          key={currentTrial}
          duration={gameState.settings.presentationTime}
        />
        <Card 
          isAnimated={animateCard}
          onAnimationEnd={() => setAnimateCard(false)}
          bordered
          className="w-80 h-80 flex items-center justify-center"
        >
          {renderShape()}
        </Card>
        <div className="h-20 flex items-center justify-center text-6xl font-bold">
            {showStart && !feedback && <div className="text-primary-light dark:text-primary-dark fade-in-out-1-5s">START</div>}
            {feedback === 'correct' && <div className="text-success fade-in-out-1s">✓</div>}
            {feedback === 'incorrect' && <div className="text-danger fade-in-out-1s">✗</div>}
        </div>
        <div className="mt-4 text-xl font-mono text-center">
          <p>진행: {Math.min(currentTrial + 1, gameState.settings.numTrials)} / {gameState.settings.numTrials}</p>
        </div>
      </div>
    </GameLayout>
  );
}
