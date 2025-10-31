import { useState, useEffect, useRef } from 'react';

interface ProgressBarProps {
  duration: number; // in milliseconds
}

export function ProgressBar({ duration }: ProgressBarProps) {
  const [progress, setProgress] = useState(100);
  const animatorRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    startTimeRef.current = Date.now();
    setProgress(100);

    const animate = () => {
      const elapsedTime = Date.now() - startTimeRef.current;
      const newProgress = 100 - (elapsedTime / duration) * 100;

      if (newProgress > 0) {
        setProgress(newProgress);
        animatorRef.current = requestAnimationFrame(animate);
      } else {
        setProgress(0);
      }
    };

    animatorRef.current = requestAnimationFrame(animate);

    return () => {
      if (animatorRef.current) {
        cancelAnimationFrame(animatorRef.current);
      }
    };
  }, [duration]);

  return (
    <div className="w-full bg-surface-light dark:bg-surface-dark rounded-full h-2.5 my-4">
      <div
        className="bg-primary-light dark:bg-primary-dark h-2.5 rounded-full"
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
}
