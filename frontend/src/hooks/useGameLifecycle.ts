import { useState, useRef, useCallback, useEffect } from 'react';

interface UseGameLifecycleProps {
  onTimeUp: () => void;
  timeLimit: number;
}

export const useGameLifecycle = ({ onTimeUp, timeLimit }: UseGameLifecycleProps) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const timeUpCallbackRef = useRef(onTimeUp);
  
  // Keep the callback ref up to date
  useEffect(() => {
    timeUpCallbackRef.current = onTimeUp;
  }, [onTimeUp]);

  const stop = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    stop();
    setElapsedTime(0);
    startTimeRef.current = Date.now();
    
    timerIntervalRef.current = setInterval(() => {
      const currentElapsedTime = Date.now() - startTimeRef.current;
      setElapsedTime(currentElapsedTime);

      if (timeLimit > 0 && currentElapsedTime >= timeLimit) {
        stop();
        timeUpCallbackRef.current();
      }
    }, 100);
  }, [stop, timeLimit]);

  const remainingTime = Math.max(0, timeLimit - elapsedTime);
  const progress = timeLimit > 0 ? (remainingTime / timeLimit) * 100 : 100;
  
  // Cleanup on unmount
  useEffect(() => {
    return () => stop();
  }, [stop]);

  return {
    remainingTime,
    progress,
    start,
    stop,
  };
};
