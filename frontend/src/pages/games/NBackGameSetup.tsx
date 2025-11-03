import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { types } from '@wails/go/models';
import { getShapeGroups } from '@api/nback';
import { useNBackStore } from '@stores/nbackStore';
import { RoundButton } from '@components/game_setup/RoundButton';
import { ShapeSetButton } from '@components/game_setup/ShapeSetButton';
import { PageLayout } from '@layout/PageLayout';
import { Button } from '@components/common/Button';
import { RealModeToggle } from '@components/common/RealModeToggle';
import { NumberInput } from '@components/common/NumberInput';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export function NBackGameSetup() {
  const navigate = useNavigate();
  const {
    gameState,
    loading,
    error: storeError,
    startGame,
    resetGameState,
  } = useNBackStore();

  const [settings, setSettings] = useState<types.NBackSettings>({
    numTrials: 25,
    presentationTime: 3000, // ms
    nBackLevel: 1,
    shapeGroup: 'random',
    isRealMode: false,
  });
  const [availableGroups, setAvailableGroups] = useState<{ [key: string]: string[] }>({});

  useEffect(() => {
    // Reset previous game state when entering setup
    resetGameState();
    getShapeGroups().then(setAvailableGroups).catch(console.error);
  }, [resetGameState]);

  useEffect(() => {
    // When gameState is created by the store action, navigate to the game
    if (gameState) {
      navigate('/games/n-back/play');
    }
  }, [gameState, navigate]);

  const handleStartGame = async (e: React.FormEvent) => {
    e.preventDefault();
    await startGame(settings);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSettings((prev: types.NBackSettings) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  const handleLevelChange = (level: number) => {
    setSettings(prev => ({ ...prev, nBackLevel: level }));
  };

  const handleGroupChange = (group: string) => {
    setSettings(prev => ({ ...prev, shapeGroup: group }));
  };
  
  const presentationTimeInSeconds = settings.presentationTime / 1000;

  return (
    <PageLayout backPath="/games" title="도형 순서 기억하기 설정">
      <div className="w-full max-w-lg mx-auto p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg">
        <form onSubmit={handleStartGame} className="space-y-6">
          <div>
            <label className="block text-base font-medium text-text-light dark:text-text-dark mb-2">라운드 선택</label>
            <div className="grid grid-cols-2 gap-4">
              <RoundButton level={1} text="1라운드 (2-back)" isSelected={settings.nBackLevel === 1} onClick={handleLevelChange} />
              <RoundButton level={2} text="2라운드 (2 & 3-back)" isSelected={settings.nBackLevel === 2} onClick={handleLevelChange} />
            </div>
          </div>

          <div>
            <label className="block text-base font-medium text-text-light dark:text-text-dark mb-2">도형 세트 선택</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <ShapeSetButton
                groupName="랜덤"
                shapes={[]}
                isSelected={settings.shapeGroup === 'random'}
                onClick={() => handleGroupChange('random')}
              />
              {Object.entries(availableGroups).map(([key, shapes]) => (
                <ShapeSetButton
                  key={key}
                  groupName={`${key.replace('group', '')}번 세트`}
                  shapes={shapes}
                  isSelected={settings.shapeGroup === key}
                  onClick={() => handleGroupChange(key)}
                />
              ))}
            </div>
          </div>

          <NumberInput
            id="numTrials"
            name="numTrials"
            label="문제 개수 (10-50)"
            value={settings.numTrials}
            onChange={handleInputChange}
            min={10}
            max={50}
          />

          <NumberInput
            id="presentationTime"
            name="presentationTime"
            label="도형 제시 시간 (초, 1-10)"
            value={presentationTimeInSeconds}
            onChange={(e) => setSettings((prev: types.NBackSettings) => ({...prev, presentationTime: Number(e.target.value) * 1000}))}
            min={1}
            max={10}
            step={0.1}
          />

          <RealModeToggle
            checked={settings.isRealMode}
            onChange={(e) => setSettings(prev => ({ ...prev, isRealMode: e.target.checked }))}
          />
          
          {storeError && <p className="text-danger text-sm text-center">{storeError}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '게임 생성 중...' : '게임 시작'}
          </Button>
        </form>
      </div>
    </PageLayout>
  );
}
