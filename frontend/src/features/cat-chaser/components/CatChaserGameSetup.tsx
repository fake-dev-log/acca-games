import { useState, useEffect, FormEvent } from 'react';
import { CatChaserSettings } from '@features/cat-chaser/logic/types';
import { useCatChaserStore } from '../stores/useCatChaserStore';
import { PageLayout } from '@components/layout/PageLayout';
import { Button } from '@components/common/Button';
import { RealModeToggle } from '@components/common/RealModeToggle';
import { NumberInput } from '@components/common/NumberInput';
import { Select } from '@components/common/Select';

export function CatChaserGameSetup() {
  const {
    startGame,
    resetGame,
  } = useCatChaserStore();

  const [settings, setSettings] = useState<CatChaserSettings>({
    numTrials: 6,
    difficulty: 'auto',
    showTime: 1.0,
    responseTimeLimit: 3.0,
    isRealMode: false,
  });

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  const handleStartGame = async (e: FormEvent) => {
    e.preventDefault();
    await startGame(settings);
  };
  
  const difficultyOptions = [
      { value: 'auto', label: '자동 (난이도 증가)' },
      { value: '4', label: '4마리 (쉬움)' },
      { value: '6', label: '6마리' },
      { value: '8', label: '8마리' },
      { value: '10', label: '10마리 (보통)' },
      { value: '12', label: '12마리' },
      { value: '14', label: '14마리' },
      { value: '16', label: '16마리 (어려움)' },
  ];

  return (
    <PageLayout backPath="/games" title="고양이 술래잡기 설정">
      <div className="w-full max-w-lg mx-auto p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg">
        <form onSubmit={handleStartGame} className="space-y-6">
           <NumberInput
            id="numTrials"
            name="numTrials"
            label="문제 개수 (3-20)"
            value={settings.numTrials}
            onChange={(e) => setSettings(p => ({...p, numTrials: Number(e.target.value)}))}
            min={3}
            max={20}
          />
          
          <Select
            label="난이도 (생쥐 수)"
            value={settings.difficulty}
            options={difficultyOptions}
            onChange={(e) => setSettings(p => ({...p, difficulty: e.target.value}))}
          />

          <NumberInput
            id="showTime"
            name="showTime"
            label="제시 시간 (초, 0.5-3.0)"
            value={settings.showTime}
            onChange={(e) => setSettings(p => ({...p, showTime: Number(e.target.value)}))}
            min={0.5}
            max={3.0}
            step={0.1}
          />

          <NumberInput
            id="responseTimeLimit"
            name="responseTimeLimit"
            label="응답 제한 시간 (초, 1.0-10.0)"
            value={settings.responseTimeLimit}
            onChange={(e) => setSettings(p => ({...p, responseTimeLimit: Number(e.target.value)}))}
            min={1.0}
            max={10.0}
            step={0.5}
          />

          <RealModeToggle
            checked={settings.isRealMode}
            onChange={(e) => setSettings(prev => ({ ...prev, isRealMode: e.target.checked }))}
          />

          <Button type="submit" className="w-full">
            게임 시작
          </Button>
        </form>
      </div>
    </PageLayout>
  );
}
