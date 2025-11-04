interface ProgressBarProps {
  progress: number; // Percentage from 0 to 100
}

export function ProgressBar({ progress }: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className="w-full bg-surface-light dark:bg-surface-dark rounded-full h-2.5 my-4">
      <div
        className="bg-primary-light dark:bg-primary-dark h-2.5 rounded-full"
        style={{ width: `${clampedProgress}%` }}
      ></div>
    </div>
  );
}
