import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRpsStore } from '@stores/rpsStore';
import { types } from '@wails/go/models';
import { PageLayout } from '@layout/PageLayout';
import { Button } from '@components/common/Button';
import { Select } from '@components/common/Select';
import { RealModeToggle } from '@components/common/RealModeToggle';
import { NumberInput } from '@components/common/NumberInput';

export function RpsGameSetup() {
  const navigate = useNavigate();
  const { gameState, loading, error, startGame, resetGameState } = useRpsStore();

  const [settings, setSettings] = useState<types.RpsSettings>({
    rounds: [1, 2, 3],
    questionsPerRound: 10,
    timeLimitMs: 3000,
    isRealMode: false,
  });
  const [selectedRound, setSelectedRound] = useState('all');

  useEffect(() => {
    resetGameState();
  }, [resetGameState]);

  useEffect(() => {
    if (gameState) {
      navigate('/games/rps/play');
    }
  }, [gameState, navigate]);

  const handleStartGame = async (e: React.FormEvent) => {
    e.preventDefault();
    let roundsToPlay: number[] = [];
    if (selectedRound === 'all') {
      roundsToPlay = [1, 2, 3];
    } else {
      roundsToPlay = [parseInt(selectedRound)];
    }
    await startGame({ ...settings, rounds: roundsToPlay });
  };

  const timeLimitInSeconds = settings.timeLimitMs / 1000;

  return (
    <PageLayout backPath="/games" title="가위바위보 설정">
      <div className="w-full max-w-lg mx-auto p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg">
        <form onSubmit={handleStartGame} className="space-y-6">
          <Select
            id="round-select"
            label="라운드 선택"
            value={selectedRound}
            onChange={(e) => setSelectedRound(e.target.value)}
          >
            <option value="all">전체 (1-3 라운드)</option>
            <option value="1">1라운드</option>
            <option value="2">2라운드</option>
            <option value="3">3라운드</option>
          </Select>

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
