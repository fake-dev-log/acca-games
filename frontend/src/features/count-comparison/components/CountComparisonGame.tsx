import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCountComparisonStore } from '../stores/countComparisonStore';
import { CountComparisonSubmission } from '../logic/types';
import { useGameLifecycle } from '@hooks/useGameLifecycle';
import WordCloudDisplay from './WordCloudDisplay';
import { Button } from '@components/common/Button';
import { ProgressBar } from '@components/common/ProgressBar';
import { GameLayout } from '@components/layout/GameLayout';

const CountComparisonGame: React.FC = () => {
  const navigate = useNavigate();
  const { currentProblem, settings, submitAnswer, fetchNextProblem, resetGame, loading } =
    useCountComparisonStore();

  const [phase, setPhase] = useState<'presentation' | 'input' | 'feedback'>('presentation');
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; correctSide: string } | null>(null);
  const answeredRef = useRef(false);
  const inputStartTimeRef = useRef<number>(0);

  const handleSubmit = useCallback(async (playerChoice: string) => {
    if (answeredRef.current) return;
    answeredRef.current = true;
    inputTimer.stop();

    if (!currentProblem) return;

    const responseTimeMs = Math.floor(Date.now() - inputStartTimeRef.current);
    const submission: CountComparisonSubmission = {
      problemNumber: currentProblem.problemNumber,
      playerChoice: playerChoice,
      responseTimeMs: responseTimeMs,
    };

    const isCorrect = await submitAnswer(submission);

    if (!settings?.isRealMode) {
      setFeedback({ isCorrect, correctSide: currentProblem.correctSide });
      setPhase('feedback');
      setTimeout(() => fetchNextProblem(), 1500);
    } else {
      fetchNextProblem();
    }
  }, [currentProblem, settings, submitAnswer, fetchNextProblem]);

  const inputTimer = useGameLifecycle({
    onTimeUp: () => {
      // In real mode, automatically submit an empty answer if time runs out
      if (settings?.isRealMode) {
        handleSubmit('');
      } else {
        // In practice mode, allow an extra second for feedback before moving on
        // This prevents the problem from immediately advancing if the user is slow
        setTimeout(() => handleSubmit(''), 1000);
      }
    },
    timeLimit: settings?.inputTime || 0,
  });

  const presentationTimer = useGameLifecycle({
    onTimeUp: () => {
      setPhase('input');
      inputStartTimeRef.current = Date.now();
      inputTimer.start();
    },
    timeLimit: settings?.presentationTime || 0,
  });

  const handleExit = useCallback(() => {
    presentationTimer.stop();
    inputTimer.stop();
    resetGame();
    navigate('/games');
  }, [presentationTimer, inputTimer, resetGame, navigate]);

  useEffect(() => {
    if (currentProblem && settings) {
      answeredRef.current = false;
      setPhase('presentation');
      setFeedback(null);
      presentationTimer.start();
    }
  }, [currentProblem, settings]);

  if (!currentProblem || !settings) {
    return (
      <GameLayout onExit={handleExit}>
        <div className="text-center text-xl">
          {loading ? '문제를 불러오는 중...' : '오류: 문제 데이터를 찾을 수 없습니다.'}
        </div>
      </GameLayout>
    );
  }

  const remainingTime = phase === 'presentation' ? presentationTimer.remainingTime : inputTimer.remainingTime;
  const progress = phase === 'presentation' ? presentationTimer.progress : inputTimer.progress;

  const renderGameContent = () => {
    if (phase === 'presentation') {
      return (
        <>
          <p className="text-xl mb-4 text-center">단어의 개수를 기억하세요!</p>
          <div className="w-full flex-grow flex justify-around border-2 border-gray-300 dark:border-gray-600 rounded p-4">
            <div className="flex-1 flex items-center justify-center overflow-hidden relative">
              <WordCloudDisplay words={currentProblem.leftWords} wordText={currentProblem.leftWordText} densityParams={currentProblem.density.left} />
            </div>
            <div className="w-px bg-gray-300 dark:bg-gray-600 mx-4"></div>
            <div className="flex-1 flex items-center justify-center overflow-hidden relative">
              <WordCloudDisplay words={currentProblem.rightWords} wordText={currentProblem.rightWordText} densityParams={currentProblem.density.right} />
            </div>
          </div>
        </>
      );
    }

    if (phase === 'input') {
      return (
        <div className="w-full flex-grow flex flex-col items-center justify-center">
          <p className="text-xl mb-4">어떤 단어가 더 많이 나왔나요?</p>
          <div className="flex justify-around w-full gap-4 max-w-md">
            <Button onClick={() => handleSubmit('left')} className="flex-1">
              {currentProblem.leftWordText}
            </Button>
            <Button onClick={() => handleSubmit('right')} className="flex-1">
              {currentProblem.rightWordText}
            </Button>
          </div>
        </div>
      );
    }
    
    if (phase === 'feedback' && feedback) {
      return (
        <div className="flex flex-col items-center justify-center text-center flex-grow">
          <p className={`text-3xl font-bold ${feedback.isCorrect ? 'text-green-500' : 'text-red-500'} mb-4`}>
            {feedback.isCorrect ? '정답!' : '오답!'}
          </p>
          {!feedback.isCorrect && (
            <p className="text-xl text-text-light dark:text-text-dark">
              정답: <span className="font-bold">{feedback.correctSide}</span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <GameLayout onExit={handleExit}>
      <div className="w-full h-full flex flex-col p-4">
        <div className="w-full my-4 max-w-2xl mx-auto flex-shrink-0">
          <div className="text-center text-lg font-bold mb-2">남은 시간: {(remainingTime / 1000).toFixed(1)}초</div>
          <ProgressBar progress={progress} />
        </div>
        <div className="w-full flex-grow flex flex-col items-stretch">
          {renderGameContent()}
        </div>
      </div>
    </GameLayout>
  );
};

export default CountComparisonGame;

