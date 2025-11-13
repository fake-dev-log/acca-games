import { FC, FormEvent } from "react";
import useShapeRotationStore from '../stores/shapeRotationStore';
import { GetShapeRotationProblems, SaveShapeRotationSession } from '@wails/go/main/App';
import { PageLayout } from '@components/layout/PageLayout';
import { RoundButton } from '@components/game_setup/RoundButton';
import { NumberInput } from '@components/common/NumberInput';
import { RealModeToggle } from '@components/common/RealModeToggle';
import { Button } from '@components/common/Button';

const ShapeRotationGameSetup: FC = () => {
  const {
    settings,
    setSettings,
    setProblems,
    setGameMode,
    setSessionId,
  } = useShapeRotationStore();

  const handleStartGame = async (e: FormEvent) => {
    e.preventDefault();
    setGameMode('loading');
    try {
      const sessionId = await SaveShapeRotationSession(settings);
      setSessionId(sessionId);
      const problems = await GetShapeRotationProblems(settings.round, settings.numProblems);
      setProblems(problems);
      setGameMode('playing');
    } catch (error) {
      console.error("Failed to start game:", error);
      setGameMode('setup'); // Go back to setup on error
    }
  };

  return (
    <PageLayout title="도형 회전하기 설정" backPath="/games">
      <div className="w-full max-w-lg mx-auto p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg">
        <form onSubmit={handleStartGame} className="space-y-6">
          <div>
            <label className="block text-base font-medium text-text-light dark:text-text-dark mb-2">라운드 선택</label>
            <div className="grid grid-cols-3 gap-4">
              <RoundButton level={1} text="영어 대문자 회전 및 반전" isSelected={settings.round === 1} onClick={(level) => setSettings({ ...settings, round: level })} />
              <RoundButton level={2} text="4x4 그리드 도형 회전 및 반전" isSelected={settings.round === 2} onClick={(level) => setSettings({ ...settings, round: level })} />
              <RoundButton level={0} text="모든 라운드" isSelected={settings.round === 0} onClick={(level) => setSettings({ ...settings, round: level })} />
            </div>
          </div>

          <NumberInput
            id="num-problems-input"
            name="numProblems"
            label={`문제 수 (2-15)`}
            value={settings.numProblems}
            onChange={(e) => setSettings({ ...settings, numProblems: parseInt(e.target.value, 10) })}
            min={2}
            max={15}
          />

          <NumberInput
            id="time-limit-input"
            name="timeLimit"
            label={`제한 시간 (초, 30-600)`}
            value={settings.timeLimit}
            onChange={(e) => setSettings({ ...settings, timeLimit: parseInt(e.target.value, 10) })}
            min={30}
            max={600}
            step={10}
          />

          <RealModeToggle
            checked={settings.isRealMode}
            onChange={(e) => setSettings({ ...settings, isRealMode: e.target.checked })}
          />

          <Button type="submit" className="w-full">
            게임 시작
          </Button>
        </form>
      </div>
    </PageLayout>
  );
};

export default ShapeRotationGameSetup;
