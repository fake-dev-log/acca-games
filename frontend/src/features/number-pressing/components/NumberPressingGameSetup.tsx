import { useState, useEffect, FormEvent } from 'react';
import { useNumberPressingStore } from '../stores/numberPressingStore';
import { types } from '@wails/go/models';
import { PageLayout } from '@components/layout/PageLayout';
import { Button } from '@components/common/Button';
import { NumberInput } from '@components/common/NumberInput';
import { RealModeToggle } from '@components/common/RealModeToggle';
import { RoundButton } from '@components/game_setup/RoundButton';

export function NumberPressingGameSetup() {
  const { loading, error, startGame, resetGame } = useNumberPressingStore();

  const [settings, setSettings] = useState<types.NumberPressingSetup>({
    isRealMode: false,
    rounds: [1, 2],
    problemsPerRound: 10,
    timeLimitR1: 30,
    timeLimitR2: 60,
  });

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  const handleStartGame = async (e: FormEvent) => {
    e.preventDefault();
    await startGame(settings);
  };

  return (
    <PageLayout backPath="/games" title="숫자 누르기 설정">
      <div className="w-full max-w-lg mx-auto p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg">
        <form onSubmit={handleStartGame} className="space-y-6">
          <div>
            <label className="block text-base font-medium text-text-light dark:text-text-dark mb-2">라운드 선택</label>
            <div className="grid grid-cols-3 gap-4">
              <RoundButton
                key={1}
                level={1}
                text="활성화된 숫자 빠르게 누르기"
                isSelected={settings.rounds.includes(1) && settings.rounds.length === 1}
                onClick={() => setSettings(prev => ({ ...prev, rounds: [1] }))}
              />
              <RoundButton
                key={2}
                level={2}
                text="무작위 배열에서 순서대로 누르기"
                isSelected={settings.rounds.includes(2) && settings.rounds.length === 1}
                onClick={() => setSettings(prev => ({ ...prev, rounds: [2] }))}
              />
              <RoundButton
                key={0}
                level={0}
                text="모든 라운드"
                isSelected={settings.rounds.length === 2}
                onClick={() => setSettings(prev => ({ ...prev, rounds: [1, 2] }))}
              />
            </div>
          </div>

          <NumberInput
            id="problemsPerRound"
            name="problemsPerRound"
            label="라운드 당 문제 수 (5-20)"
            value={settings.problemsPerRound}
            onChange={(e) => setSettings(prev => ({ ...prev, problemsPerRound: Number(e.target.value) }))}
            min={5}
            max={20}
          />

          <NumberInput
            id="timeLimitR1"
            name="timeLimitR1"
            label="1라운드 제한 시간 (초, 10-60)"
            value={settings.timeLimitR1}
            onChange={(e) => setSettings(prev => ({ ...prev, timeLimitR1: Number(e.target.value) }))}
            min={10}
            max={60}
          />

          <NumberInput
            id="timeLimitR2"
            name="timeLimitR2"
            label="2라운드 제한 시간 (초, 30-120)"
            value={settings.timeLimitR2}
            onChange={(e) => setSettings(prev => ({ ...prev, timeLimitR2: Number(e.target.value) }))}
            min={30}
            max={120}
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