import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNumberPressingStore } from '@stores/numberPressingStore';
import { types } from '@wails/go/models';
import { PageLayout } from '@layout/PageLayout';
import { Button } from '@components/common/Button';
import { Select } from '@components/common/Select';
import { RealModeToggle } from '@components/common/RealModeToggle';
import { NumberInput } from '@components/common/NumberInput';

export function NumberPressingGameSetup() {
  const navigate = useNavigate();
  const { gameState, loading, error, startGame, resetGameState } = useNumberPressingStore();

  const [settings, setSettings] = useState<types.NumberPressingSetup>({
    isRealMode: false,
    rounds: [1, 2],
    problemsPerRound: 10,
    timeLimitR1: 60, // 1 minute
    timeLimitR2: 120, // 2 minutes
  });
  const [selectedRound, setSelectedRound] = useState('all');

  useEffect(() => {
    resetGameState();
  }, [resetGameState]);

  useEffect(() => {
    if (gameState) {
      navigate('/games/number-pressing/play');
    }
  }, [gameState, navigate]);

  const handleStartGame = async (e: React.FormEvent) => {
    e.preventDefault();
    let roundsToPlay: number[] = [];
    if (selectedRound === 'all') {
      roundsToPlay = [1, 2];
    } else {
      roundsToPlay = [parseInt(selectedRound)];
    }
    await startGame({ ...settings, rounds: roundsToPlay });
  };

  return (
    <PageLayout backPath="/games" title="숫자 누르기 설정">
      <div className="w-full max-w-lg mx-auto p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg">
        <form onSubmit={handleStartGame} className="space-y-6">
          <Select
            id="round-select"
            label="라운드 선택"
            value={selectedRound}
            onChange={(e) => setSelectedRound(e.target.value)}
            disabled={settings.isRealMode}
          >
            <option value="all">전체 (1-2 라운드)</option>
            <option value="1">1라운드</option>
            <option value="2">2라운드</option>
          </Select>

          <NumberInput
            id="problemsPerRound"
            name="problemsPerRound"
            label="라운드 당 문제 수 (5-30)"
            value={settings.problemsPerRound}
            onChange={(e) => setSettings(prev => ({ ...prev, problemsPerRound: Number(e.target.value) }))}
            min={5}
            max={30}
            disabled={settings.isRealMode}
          />

          <NumberInput
            id="timeLimitR1"
            name="timeLimitR1"
            label="1라운드 제한 시간 (초, 20-120)"
            value={settings.timeLimitR1}
            onChange={(e) => setSettings(prev => ({ ...prev, timeLimitR1: Number(e.target.value) }))}
            min={20}
            max={120}
            disabled={settings.isRealMode || selectedRound === '2'}
          />

          <NumberInput
            id="timeLimitR2"
            name="timeLimitR2"
            label="2라운드 제한 시간 (초, 30-300)"
            value={settings.timeLimitR2}
            onChange={(e) => setSettings(prev => ({ ...prev, timeLimitR2: Number(e.target.value) }))}
            min={30}
            max={300}
            disabled={settings.isRealMode || selectedRound === '1'}
          />

          <RealModeToggle
            checked={settings.isRealMode}
            onChange={(e) => {
                const isChecked = e.target.checked;
                setSettings(prev => ({
                    ...prev,
                    isRealMode: isChecked,
                    // Reset to defaults if real mode is selected
                    rounds: isChecked ? [1, 2] : prev.rounds,
                    problemsPerRound: isChecked ? 10 : prev.problemsPerRound,
                    timeLimitR1: isChecked ? 60 : prev.timeLimitR1,
                    timeLimitR2: isChecked ? 120 : prev.timeLimitR2,
                }));
                if (isChecked) {
                    setSelectedRound('all');
                }
            }}
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