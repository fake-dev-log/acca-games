import { useState, FormEvent } from 'react';
import { usePathStore } from '../stores/pathStore';
import { PathSettings } from '../logic/types';
import { ROUND_CONFIGS } from '../logic/generator';
import { PageLayout } from '@components/layout/PageLayout';
import { Button } from '@components/common/Button';
import { RealModeToggle } from '@components/common/RealModeToggle';
import { NumberInput } from '@components/common/NumberInput';
import { RoundButton } from '@components/game_setup/RoundButton';

const ALL_ROUNDS = [1, 2, 3];
const roundText = (round: number) => {
  const { size, vehicles } = ROUND_CONFIGS[round];
  return `${size}×${size} · ${vehicles[0] === vehicles[1] ? vehicles[0] : vehicles.join('~')}대`;
};

export function PathGameSetup() {
  const { error, startGame } = usePathStore();
  const [settings, setSettings] = useState<PathSettings>({ rounds: ALL_ROUNDS, timeLimitSec: 180, isRealMode: false });

  const handleStartGame = (e: FormEvent) => {
    e.preventDefault();
    startGame(settings);
  };

  return (
    <PageLayout backPath="/games" title="길 만들기 설정">
      <div className="w-full max-w-xl mx-auto p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg">
        <form onSubmit={handleStartGame} className="space-y-6">
          <div>
            <label className="block text-base font-medium mb-2">라운드 선택</label>
            <div className="grid grid-cols-4 gap-3">
              {ALL_ROUNDS.map((round) => (
                <RoundButton key={round} level={round} text={roundText(round)}
                  isSelected={settings.rounds.length === 1 && settings.rounds[0] === round}
                  onClick={() => setSettings((p) => ({ ...p, rounds: [round] }))} />
              ))}
              <RoundButton level={0} text="모든 라운드" isSelected={settings.rounds.length === ALL_ROUNDS.length}
                onClick={() => setSettings((p) => ({ ...p, rounds: ALL_ROUNDS }))} />
            </div>
          </div>

          <NumberInput id="timeLimitSec" name="timeLimitSec" label="라운드별 제한 시간 (초, 60-600)"
            value={settings.timeLimitSec} min={60} max={600} step={30}
            onChange={(e) => setSettings((p) => ({ ...p, timeLimitSec: Number(e.target.value) }))} />

          <RealModeToggle checked={settings.isRealMode}
            onChange={(e) => setSettings((p) => ({ ...p, isRealMode: e.target.checked }))} />
          <p className="text-sm opacity-70 text-center">연습 모드에서는 문제마다 '정답 보기'로 최소 울타리 배치를 볼 수 있습니다(그 문제는 미해결로 기록).</p>

          {error && <p className="text-danger text-sm text-center">{error}</p>}

          <Button type="submit" className="w-full">게임 시작</Button>
        </form>
      </div>
    </PageLayout>
  );
}
