import { useState, FormEvent } from 'react';
import { useAppointmentStore } from '../stores/appointmentStore';
import { AppointmentSettings } from '../logic/types';
import { ROUND_INFO } from '../logic/AppointmentEngine';
import { PageLayout } from '@components/layout/PageLayout';
import { Button } from '@components/common/Button';
import { RealModeToggle } from '@components/common/RealModeToggle';
import { NumberInput } from '@components/common/NumberInput';
import { RoundButton } from '@components/game_setup/RoundButton';

const ALL_ROUNDS = [1, 2, 3, 4];

export function AppointmentGameSetup() {
  const { error, startGame } = useAppointmentStore();
  const [settings, setSettings] = useState<AppointmentSettings>({
    rounds: ALL_ROUNDS,
    problemsPerRound: 4,
    presentationTimeMs: 3000,
    responseTimeLimitMs: 7000,
    isRealMode: false,
  });

  const handleStartGame = (e: FormEvent) => {
    e.preventDefault();
    startGame(settings);
  };

  return (
    <PageLayout backPath="/games" title="약속 정하기 설정">
      <div className="w-full max-w-2xl mx-auto p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg">
        <form onSubmit={handleStartGame} className="space-y-6">
          <div>
            <label className="block text-base font-medium mb-2">라운드 선택</label>
            <div className="grid grid-cols-5 gap-3">
              {ALL_ROUNDS.map((round) => (
                <RoundButton key={round} level={round}
                  text={round === 4 ? '버스 (아무도 안 탄 번호)' : ROUND_INFO[round].name}
                  isSelected={settings.rounds.length === 1 && settings.rounds[0] === round}
                  onClick={() => setSettings((prev) => ({ ...prev, rounds: [round] }))} />
              ))}
              <RoundButton level={0} text="모든 라운드" isSelected={settings.rounds.length === ALL_ROUNDS.length}
                onClick={() => setSettings((prev) => ({ ...prev, rounds: ALL_ROUNDS }))} />
            </div>
          </div>

          <NumberInput id="problemsPerRound" name="problemsPerRound" label="라운드당 문제 수 (2-10)"
            value={settings.problemsPerRound} min={2} max={10}
            onChange={(e) => setSettings((prev) => ({ ...prev, problemsPerRound: Number(e.target.value) }))} />

          <NumberInput id="presentationTime" name="presentationTime" label="한 사람 제시 시간 (초, 1-5)"
            value={settings.presentationTimeMs / 1000} min={1} max={5} step={0.5}
            onChange={(e) => setSettings((prev) => ({ ...prev, presentationTimeMs: Number(e.target.value) * 1000 }))} />

          <NumberInput id="responseTimeLimit" name="responseTimeLimit" label="응답 제한 시간 (초, 3-15)"
            value={settings.responseTimeLimitMs / 1000} min={3} max={15}
            onChange={(e) => setSettings((prev) => ({ ...prev, responseTimeLimitMs: Number(e.target.value) * 1000 }))} />

          <RealModeToggle checked={settings.isRealMode}
            onChange={(e) => setSettings((prev) => ({ ...prev, isRealMode: e.target.checked }))} />

          {error && <p className="text-danger text-sm text-center">{error}</p>}

          <Button type="submit" className="w-full">게임 시작</Button>
        </form>
      </div>
    </PageLayout>
  );
}
