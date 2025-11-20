interface ProgressBarProps {
  progress: number; // Percentage from 0 to 100
  className?: string;
}

export function ProgressBar({ progress, className = '' }: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className={`w-full bg-surface-light dark:bg-surface-dark rounded-full h-2.5 ${className}`}>
      <div
        className="bg-primary-light dark:bg-primary-dark h-2.5 rounded-full"
        style={{ width: `${clampedProgress}%` }}
      ></div>
    </div>
  );
}
