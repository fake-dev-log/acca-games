import React, { FormEvent } from 'react';
import { Button } from '@components/common/Button';
import { NumberInput } from '@components/common/NumberInput';
import { RealModeToggle } from '@components/common/RealModeToggle';
import { useCountComparisonStore } from '../stores/countComparisonStore';
import { PageLayout } from '@components/layout/PageLayout';

const CountComparisonGameSetup: React.FC = () => {
  const { startGame, loading, error, settings, setSettings } = useCountComparisonStore();

  const handleStartGame = async (e: FormEvent) => {
    e.preventDefault();
    if (settings) {
      await startGame(settings);
    }
  };
  
  if (!settings) return null; // Or a loading indicator

  return (
    <PageLayout title="개수 비교하기 설정" backPath="/games">
      <div className="w-full max-w-lg mx-auto p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg">
        <form onSubmit={handleStartGame} className="space-y-6">
          {error && <p className="text-red-500 text-center">{error}</p>}

          <NumberInput
            id="numProblems"
            name="numProblems"
            label="문제 수 (1-50)"
            value={settings.numProblems}
            onChange={(e) => setSettings({ ...settings, numProblems: parseInt(e.target.value, 10) })}
            min={1}
            max={50}
          />

          <NumberInput
            id="presentationTime"
            name="presentationTime"
            label="제시 시간 (초, 0.5-3)"
            value={settings.presentationTime / 1000}
            onChange={(e) => setSettings({ ...settings, presentationTime: parseFloat(e.target.value) * 1000 })}
            min={0.5}
            max={3}
            step={"0.1"}
          />

          <NumberInput
            id="inputTime"
            name="inputTime"
            label="입력 시간 (초, 1-10)"
            value={settings.inputTime / 1000}
            onChange={(e) => setSettings({ ...settings, inputTime: parseFloat(e.target.value) * 1000 })}
            min={1}
            max={10}
            step={"0.1"}
          />

          <RealModeToggle
            checked={settings.isRealMode}
            onChange={(e) => setSettings({ ...settings, isRealMode: e.target.checked })}
          />

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? '시작 중...' : '게임 시작'}
          </Button>
        </form>
      </div>
    </PageLayout>
  );
};

export default CountComparisonGameSetup;
