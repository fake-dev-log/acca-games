import {FC, useCallback, useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import useShapeRotationStore from '../stores/shapeRotationStore';
import {GameLayout} from '@components/layout/GameLayout';
import ShapeDisplay from '@components/shapes/shape_rotation/ShapeDisplay';
import {Button} from '@components/common/Button';
import {ProgressBar} from '@components/common/ProgressBar';
import {SolutionTray} from '@components/game_setup/SolutionTray';
import {FaArrowRotateLeft, FaArrowRotateRight} from "react-icons/fa6";
import {RiFlipHorizontalFill, RiFlipVerticalFill} from "react-icons/ri";
import {useGameLifecycle} from "@hooks/useGameLifecycle";

const ShapeRotationGame: FC = () => {
  const navigate = useNavigate();
  const {
    sessionId,
    settings,
    problems,
    currentProblemIndex,
    userSolution,
    clickCount,
    addTransform,
    undoTransform,
    clearTransforms,
    nextProblem,
    submitAnswer,
    setGameMode,
    resetGame,
  } = useShapeRotationStore();

  const [isNewProblem, setIsNewProblem] = useState(true);
  const startTimeRef = useRef<number>(0);
  const answeredRef = useRef(false);

  const currentProblem = problems[currentProblemIndex];

  const handleSubmit = useCallback(() => {
    if (answeredRef.current || !sessionId) return;
    answeredRef.current = true;
    
    const elapsedTime = Date.now() - startTimeRef.current;
    
    submitAnswer(elapsedTime);

    if (currentProblemIndex < problems.length - 1) {
      nextProblem();
    } else {
      setGameMode('result');
    }
  }, [sessionId, currentProblemIndex, problems.length, nextProblem, setGameMode, submitAnswer]);

  const { remainingTime, progress, start, stop } = useGameLifecycle({
    onTimeUp: handleSubmit,
    timeLimit: settings.timeLimit * 1000,
  });

  const handleExit = useCallback(() => {
    stop();
    resetGame();
    navigate('/games');
  }, [stop, resetGame, navigate]);

  useEffect(() => {
    if (!currentProblem) {
      handleExit();
      return;
    }
    answeredRef.current = false;
    startTimeRef.current = Date.now();
    start();
    
    setIsNewProblem(true);
    const flashTimer = setTimeout(() => setIsNewProblem(false), 1000);

    return () => {
      clearTimeout(flashTimer);
    }
  }, [currentProblem, start, handleExit]);
  
  const handleManualSubmit = () => {
    stop();
    handleSubmit();
  }

  if (!currentProblem) {
    return <GameLayout onExit={handleExit}><div>문제를 불러오는 중...</div></GameLayout>;
  }

  const animationClass = isNewProblem ? 'div-border-flash-light dark:div-border-flash-dark' : 'border-transparent';

  return (
    <GameLayout onExit={handleExit}>
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="w-full mt-4">
          <div className="text-center text-lg font-bold mb-2">남은 시간: {(remainingTime / 1000).toFixed(1)}초</div>
          <ProgressBar progress={progress}/>
        </div>
        <div className="w-full grid grid-cols-2 gap-8 flex-grow">
          {/* Left Column: Shapes */}
          <div className={`flex flex-row items-center justify-center gap-4 p-4 rounded-lg border-2 ${animationClass}`}>
            <div className="flex items-center justify-center gap-4 flex-grow">
              <div className="flex flex-col items-center gap-2">
                <h3 className="text-2xl font-bold">전</h3>
                <ShapeDisplay 
                  shapeString={currentProblem.InitialShape} 
                  gridPath={currentProblem.InitialGridPath}
                  centerX={currentProblem.InitialShapeCenterX} 
                  centerY={currentProblem.InitialShapeCenterY} />
              </div>
              <div className="border-l-2 border-gray-300 h-40"></div>
              <div className="flex flex-col items-center gap-2">
                <h3 className="text-2xl font-bold">후</h3>
                <ShapeDisplay 
                  shapeString={currentProblem.FinalShape} 
                  gridPath={currentProblem.FinalGridPath}
                  centerX={currentProblem.FinalShapeCenterX} 
                  centerY={currentProblem.FinalShapeCenterY} />
              </div>
            </div>
          </div>

          {/* Right Column: Controls */}
          <div className="flex flex-col justify-center gap-6">
            <div>
              <h4 className="font-bold text-lg mb-2">변환 (클릭 {clickCount}/20)</h4>
              <div className="grid grid-cols-2 gap-4">
                <Button onClick={() => addTransform('rotate_left_45')}>
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FaArrowRotateLeft size={"64"}/>
                    왼쪽 45° 회전
                  </div>
                </Button>
                <Button onClick={() => addTransform('rotate_right_45')}>
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FaArrowRotateRight size={"64"}/>
                    오른쪽 45° 회전
                  </div>
                </Button>
                <Button onClick={() => addTransform('flip_horizontal')}>
                  <div className="flex flex-col items-center justify-center gap-2">
                    <RiFlipHorizontalFill size={"64"} />
                    좌우 반전
                  </div>
                </Button>
                <Button onClick={() => addTransform('flip_vertical')}>
                  <div className="flex flex-col items-center justify-center gap-2">
                    <RiFlipVerticalFill size={"64"} />
                    상하 반전
                  </div>
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h4 className="font-bold text-lg mb-2">나의 풀이 (최소 {currentProblem.MinMoves}번)</h4>
              <SolutionTray solution={userSolution} maxSlots={20}/>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <Button onClick={undoTransform}>하나 지우기</Button>
                <Button onClick={clearTransforms}>전체 지우기</Button>
              </div>
            </div>

            <Button onClick={handleManualSubmit} className="w-full mt-4">답안 제출</Button>
          </div>
        </div>
      </div>
    </GameLayout>
  );
};

export default ShapeRotationGame;