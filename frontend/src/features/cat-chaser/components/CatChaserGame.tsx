import { useEffect, useState } from 'react';
import { useCatChaserStore } from '../stores/useCatChaserStore';
import { CatChaserProblem, CatChaserResult } from '@features/cat-chaser/logic/types';
import { ProgressBar } from '@components/common/ProgressBar';
import { Button } from '@components/common/Button';
import { GameLayout } from '@components/layout/GameLayout';

export function CatChaserGame() {
  const {
    gameState,
    step,
    currentProblem,
    currentRound,
    setStep,
    submitAnswer,
    startRound,
    lastResult,
    resetGame,
  } = useCatChaserStore();

  const [decisionStartTime, setDecisionStartTime] = useState(0);
  const [feedbackVisible, setFeedbackVisible] = useState(false);

  // Timer Logic for Presentation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const showTimeMs = (gameState?.settings.showTime || 1) * 1000;

    if (step === 'MOUSE') {
      timer = setTimeout(() => setStep('ISI'), showTimeMs);
    } else if (step === 'ISI') {
      timer = setTimeout(() => setStep('CAT_NORMAL'), 300);
    } else if (step === 'CAT_NORMAL') {
      timer = setTimeout(() => setStep('CAT_HIGHLIGHT'), 500);
    } else if (step === 'CAT_HIGHLIGHT') {
      timer = setTimeout(() => {
        setStep('DECISION_RED');
        setDecisionStartTime(Date.now());
      }, showTimeMs);
    }
    return () => clearTimeout(timer);
  }, [step, gameState, setStep]);

  // Handle Decision Timeout
  useEffect(() => {
      if ((step === 'DECISION_RED' || step === 'DECISION_BLUE') && !feedbackVisible) {
          const limit = (gameState?.settings.responseTimeLimit || 3) * 1000;
          setDecisionStartTime(Date.now()); // Reset start time when entering step
          
          const timer = setTimeout(() => {
              handleTimeout();
          }, limit);
          return () => clearTimeout(timer);
      }
  }, [step, gameState, feedbackVisible]); 

  const handleTimeout = async () => {
      const timeTaken = (gameState?.settings.responseTimeLimit || 3) * 1000;
      const target = step === 'DECISION_RED' ? 'RED' : 'BLUE';
      await submitAnswer(target, 'TIMEOUT', 0, timeTaken); 
      proceedToNext();
  };

  const proceedToNext = () => {
      setFeedbackVisible(false);
      if (step === 'DECISION_RED') {
          setStep('DECISION_BLUE');
      } else {
          startRound(currentRound + 1);
      }
  };

  const handleDecision = async (choice: 'CAUGHT' | 'MISSED', confidence: number) => {
      const timeTaken = Date.now() - decisionStartTime;
      const target = step === 'DECISION_RED' ? 'RED' : 'BLUE';
      
      await submitAnswer(target, choice, confidence, timeTaken);

      if (!gameState?.settings.isRealMode) {
          setFeedbackVisible(true);
          setTimeout(() => {
              proceedToNext();
          }, 1500);
      } else {
          proceedToNext();
      }
  };
  
  if (!currentProblem) return null;

  let content;
  if (step === 'DECISION_RED' || step === 'DECISION_BLUE') {
      content = (
          <DecisionScreen
              key={step}
              step={step}
              limit={(gameState?.settings.responseTimeLimit || 3)}
              onDecide={handleDecision}
              currentProblem={currentProblem}
              feedbackVisible={feedbackVisible}
              lastResult={lastResult}
          />
      );
  } else {
      content = <ProblemScreen step={step} problem={currentProblem} />;
  }

  return (
      <GameLayout onExit={resetGame}>
          <div className="w-full h-full flex flex-col items-center justify-center relative">
              <div className="absolute top-0 right-0 p-4 font-mono text-xl">
                  {currentRound} / {gameState?.settings.numTrials}
              </div>
              {content}
          </div>
      </GameLayout>
  );
}

// --- Sub Components ---

function FeedbackScreen({ result, onNext }: { result: CatChaserResult, onNext: () => void }) {
    // result.isCorrect, result.correctChoice ("CAUGHT"/"MISSED")
    // targetColor is in result
    
    const isRed = result.targetColor === 'RED';
    const colorName = isRed ? '빨간 고양이' : '파란 고양이';
    const bgColor = isRed ? 'bg-red-100 dark:bg-red-900' : 'bg-blue-100 dark:bg-blue-900';
    const borderColor = isRed ? 'border-red-500' : 'border-blue-500';
    
    const correctText = result.correctChoice === 'CAUGHT' ? '잡았다!' : '놓쳤다!';
    
    return (
        <div className="flex flex-col items-center justify-center h-full space-y-8 animate-in fade-in zoom-in duration-300">
             <div className={`w-32 h-32 flex items-center justify-center text-7xl rounded-xl border-4 ${borderColor} ${bgColor}`}>
                🐱
            </div>
            
            <h2 className="text-3xl font-bold">{colorName} 결과</h2>
            
            <div className={`text-4xl font-extrabold ${result.isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {result.isCorrect ? '정답입니다!' : '틀렸습니다!'}
            </div>
            
            <div className="text-xl">
                실제 결과: <span className="font-bold">{correctText}</span>
            </div>
            
            <div className="text-lg text-gray-600 dark:text-gray-400">
                (당신의 선택: {result.playerChoice === 'CAUGHT' ? '잡았다' : '놓쳤다'})
            </div>
            
            <Button onClick={onNext} className="w-full max-w-xs mt-8" autoFocus>
                다음
            </Button>
        </div>
    );
}

// --- Sub Components ---

function TimerProgressBar({ duration, isActive }: { duration: number, isActive: boolean }) {
    const [progress, setProgress] = useState(100);
    
    useEffect(() => {
        if (!isActive) return;
        const start = Date.now();
        // Reset progress on duration change/active
        setProgress(100);

        const interval = setInterval(() => {
            const elapsed = Date.now() - start;
            const remaining = Math.max(0, duration - elapsed);
            setProgress((remaining / duration) * 100);
            if (remaining <= 0) clearInterval(interval);
        }, 50);
        return () => clearInterval(interval);
    }, [duration, isActive]);

    return <ProgressBar progress={progress} />;
}

function ProblemScreen({ step, problem }: { step: string; problem: CatChaserProblem }) {
    const gridSize = 6;
    const cells = Array.from({ length: gridSize * gridSize }, (_, i) => i);

    return (
        <div className="flex flex-col items-center justify-center h-full w-full">
            <div className="grid grid-cols-6 gap-3 bg-gray-200 dark:bg-gray-700 p-6 rounded-xl shadow-lg">
                {cells.map((idx) => {
                    let content = '';
                    let bgColor = 'bg-white dark:bg-gray-800';
                    
                    if (step === 'MOUSE' && problem.micePositions.includes(idx)) {
                        content = '🐭';
                    } else if (step.startsWith('CAT')) {
                        const isCat = problem.catPositions.includes(idx);
                        if (isCat) {
                            content = '🐱';
                            if (step === 'CAT_HIGHLIGHT') {
                                // Check if this cat is Red or Blue Target
                                const catIdx = problem.catPositions.indexOf(idx);
                                if (catIdx === problem.redCatIndex) {
                                    bgColor = 'bg-red-200 dark:bg-red-900 border-4 border-red-500';
                                } else if (catIdx === problem.blueCatIndex) {
                                    bgColor = 'bg-blue-200 dark:bg-blue-900 border-4 border-blue-500';
                                }
                            }
                        }
                    }

                    return (
                        <div
                            key={idx}
                            className={`w-16 h-16 md:w-20 md:h-20 flex items-center justify-center text-4xl rounded-lg shadow-sm transition-colors duration-200 ${bgColor}`}
                        >
                            {content}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function DecisionScreen({ 
    step, 
    limit, 
    onDecide,
    currentProblem,
    feedbackVisible,
    lastResult
}: { 
    step: 'DECISION_RED' | 'DECISION_BLUE'; 
    limit: number; 
    onDecide: (c: 'CAUGHT' | 'MISSED', conf: number) => void;
    currentProblem: CatChaserProblem;
    feedbackVisible: boolean;
    lastResult: CatChaserResult | null;
}) {
    const targetText = step === 'DECISION_RED' ? '빨간 고양이' : '파란 고양이';
    const borderColor = step === 'DECISION_RED' ? 'border-red-500' : 'border-blue-500';
    const bgColor = step === 'DECISION_RED' ? 'bg-red-100 dark:bg-red-900' : 'bg-blue-100 dark:bg-blue-900';

    return (
        <div className="flex flex-col items-center justify-center h-full space-y-8 w-full max-w-4xl mx-auto">
            <div className="w-full">
                <TimerProgressBar duration={limit * 1000} isActive={!feedbackVisible} />
            </div>
            
            <div className={`w-24 h-24 flex items-center justify-center text-6xl rounded-lg border-4 ${borderColor} ${bgColor}`}>
                🐱
            </div>
            <h2 className="text-2xl font-bold">{targetText}</h2>

            <div className="flex items-center justify-between w-full">
                 <div className="flex items-center">
                    <span className="text-xl font-bold mr-4">← 놓쳤다</span>
                 </div>
                 
                 {/* Inline Feedback Area */}
                 <div className="h-16 flex flex-col items-center justify-center min-w-[200px]">
                    {feedbackVisible && lastResult && (
                        <div className={`text-xl font-bold animate-pulse ${lastResult.isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {lastResult.isCorrect ? `정답 (+${lastResult.score.toFixed(1)})` : `오답 (${lastResult.score.toFixed(1)})`}
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                정답: {lastResult.correctChoice === 'CAUGHT' ? '잡았다' : '놓쳤다'}
                            </div>
                        </div>
                    )}
                 </div>

                 <div className="flex items-center">
                    <span className="text-xl font-bold ml-4">잡았다 →</span>
                 </div>
            </div>

            <div className="grid grid-cols-8 gap-2 w-full">
                {/* Missed Side: 4 3 2 1 */}
                <ConfidenceButton label="매우 확실" onClick={() => onDecide('MISSED', 4)} color="red" disabled={feedbackVisible} />
                <ConfidenceButton label="확실" onClick={() => onDecide('MISSED', 3)} color="red" disabled={feedbackVisible} />
                <ConfidenceButton label="조금 확실" onClick={() => onDecide('MISSED', 2)} color="red" disabled={feedbackVisible} />
                <ConfidenceButton label="불확실" onClick={() => onDecide('MISSED', 1)} color="red" disabled={feedbackVisible} />
                
                {/* Caught Side: 1 2 3 4 */}
                <ConfidenceButton label="불확실" onClick={() => onDecide('CAUGHT', 1)} color="green" disabled={feedbackVisible} />
                <ConfidenceButton label="조금 확실" onClick={() => onDecide('CAUGHT', 2)} color="green" disabled={feedbackVisible} />
                <ConfidenceButton label="확실" onClick={() => onDecide('CAUGHT', 3)} color="green" disabled={feedbackVisible} />
                <ConfidenceButton label="매우 확실" onClick={() => onDecide('CAUGHT', 4)} color="green" disabled={feedbackVisible} />
            </div>
        </div>
    );
}

function ConfidenceButton({ label, onClick, color, disabled }: { label: string, onClick: () => void, color: 'red'|'green', disabled?: boolean }) {
    const baseClass = "h-24 rounded-lg font-bold text-sm md:text-base flex flex-col items-center justify-center shadow transition-transform";
    const activeClass = "active:scale-95";
    const disabledClass = "opacity-50 cursor-not-allowed";
    
    let colorClass = "";
    if (color === 'red') {
        colorClass = "bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-900 dark:text-red-100";
    } else {
        colorClass = "bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-900 dark:text-green-100";
    }
    
    return (
        <button 
            className={`${baseClass} ${colorClass} ${disabled ? disabledClass : activeClass}`} 
            onClick={onClick}
            disabled={disabled}
        >
            {label}
        </button>
    )
}
