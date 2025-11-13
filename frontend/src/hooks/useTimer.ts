import { useState, useEffect, useRef, useCallback } from 'react';

export const useTimer = (onTimeout?: () => void, timeoutSeconds: number = 0) => {
  const [isActive, setIsActive] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Use a ref to hold the callback to avoid it being a dependency in useEffect
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  useEffect(() => {
    if (isActive) {
      // Set the start time when the timer becomes active.
      // This correctly handles resuming from a paused state.
      startTimeRef.current = Date.now() - elapsedTime;

      intervalRef.current = setInterval(() => {
        setElapsedTime(Date.now() - startTimeRef.current);
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive]);

  useEffect(() => {
    // Clear any existing timeout when dependencies change
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (isActive && timeoutSeconds > 0) {
      const remainingTime = (timeoutSeconds * 1000) - elapsedTime;
      if (remainingTime > 0) {
        timeoutRef.current = setTimeout(() => {
          onTimeoutRef.current?.();
        }, remainingTime);
      } else {
        // If already past the timeout, trigger it immediately.
        onTimeoutRef.current?.();
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isActive, elapsedTime, timeoutSeconds]);

  const start = useCallback(() => {
    setIsActive(true);
  }, []);

  const stop = useCallback(() => {
    setIsActive(false);
  }, []);

  const reset = useCallback(() => {
    setIsActive(false);
    setElapsedTime(0);
  }, []);

  return { elapsedTime, start, stop, reset, isActive };
};
