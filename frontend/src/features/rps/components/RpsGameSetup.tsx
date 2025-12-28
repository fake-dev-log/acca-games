import { useState, useEffect, FormEvent } from 'react';
import { useRpsStore } from '../stores/rpsStore';
import { RpsSettings } from '../logic/types';
import { PageLayout } from '@components/layout/PageLayout';
import { Button } from '@components/common/Button';
import { RealModeToggle } from '@components/common/RealModeToggle';
import { NumberInput } from '@components/common/NumberInput';
import { RoundButton } from '@components/game_setup/RoundButton';

export function RpsGameSetup() {
  const { loading, error, startGame, resetGame } = useRpsStore();

  const [settings, setSettings] = useState<RpsSettings>({
    rounds: [1, 2, 3],
    questionsPerRound: 10,
    timeLimitMs: 3000,
    isRealMode: false,
  });

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  const handleStartGame = async (e: FormEvent) => {
    e.preventDefault();
    await startGame(settings);
  };

  const timeLimitInSeconds = settings.timeLimitMs / 1000;

  return (
    <PageLayout backPath="/games" title="가위바위보 설정">
      <div className="w-full max-w-lg mx-auto p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg">
        <form onSubmit={handleStartGame} className="space-y-6">
          <div>
            <label className="block text-base font-medium text-text-light dark:text-text-dark mb-2">라운드 선택</label>
            <div className="grid grid-cols-4 gap-4">
              <RoundButton
                key={1}
                level={1}
                text="'나'의 입장에서 선택"
                isSelected={settings.rounds.includes(1) && settings.rounds.length === 1}
                onClick={() => setSettings(prev => ({ ...prev, rounds: [1] }))}
              />
              <RoundButton
                key={2}
                level={2}
                text="'상대'의 입장에서 선택"
                isSelected={settings.rounds.includes(2) && settings.rounds.length === 1}
                onClick={() => setSettings(prev => ({ ...prev, rounds: [2] }))}
              />
              <RoundButton
                key={3}
                level={3}
                text="'나' 또는 '상대'의 입장에서 선택"
                isSelected={settings.rounds.includes(3) && settings.rounds.length === 1}
                onClick={() => setSettings(prev => ({ ...prev, rounds: [3] }))}
              />
              <RoundButton
                key={0}
                level={0}
                text="모든 라운드"
                isSelected={settings.rounds.length === 3}
                onClick={() => setSettings(prev => ({ ...prev, rounds: [1, 2, 3] }))}
              />
            </div>
          </div>

          <NumberInput
            id="questionsPerRound"
            name="questionsPerRound"
            label="라운드 당 문제 수 (3-30)"
            value={settings.questionsPerRound}
            onChange={(e) => setSettings(prev => ({ ...prev, questionsPerRound: Number(e.target.value) }))}
            min={3}
            max={30}
          />

          <NumberInput
            id="timeLimit"
            name="timeLimit"
            label="문제별 제한 시간 (초, 0.5-10)"
            value={timeLimitInSeconds}
            onChange={(e) => setSettings(prev => ({ ...prev, timeLimitMs: Number(e.target.value) * 1000 }))}
            min={0.5}
            max={10}
            step={0.1}
          />

          <RealModeToggle
            checked={settings.isRealMode}
            onChange={(e) => setSettings(prev => ({ ...prev, isRealMode: e.target.checked }))}
          />
          
          {error && <p className="text-danger text-sm text-center">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '게임 생성 중...' : '게임 시작'}
          </Button>
        </form>
      </div>
    </PageLayout>
  );
}
