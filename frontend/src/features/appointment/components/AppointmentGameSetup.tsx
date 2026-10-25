import { useState, FormEvent } from 'react';
import { useAppointmentStore } from '../stores/appointmentStore';
import { AppointmentSettings } from '../logic/types';
import { REAL_SETTINGS, ROUND_INFO } from '../logic/AppointmentEngine';
import { PageLayout } from '@components/layout/PageLayout';
import { Button } from '@components/common/Button';
import { RealModeToggle } from '@components/common/RealModeToggle';
import { NumberInput } from '@components/common/NumberInput';
import { RoundButton } from '@components/game_setup/RoundButton';

const ALL_ROUNDS = [1, 2, 3, 4];

export function AppointmentGameSetup() {
  const { error, startGame } = useAppointmentStore();
  const [settings, setSettings] = useState<AppointmentSettings>({ ...REAL_SETTINGS, isRealMode: false });
  const real = settings.isRealMode;

  const handleStartGame = (e: FormEvent) => {
    e.preventDefault();
    // 실전은 실제 시험과 같은 구성으로 고정한다
    startGame(real ? REAL_SETTINGS : settings);
  };

  return (
    <PageLayout backPath="/games" title="약속 정하기 설정">
      <div className="w-full max-w-2xl mx-auto p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg">
        <form onSubmit={handleStartGame} className="space-y-6">
          <p className="text-sm opacity-80 leading-relaxed">
            세 사람이 차례로 선호를 잠깐 보여 줍니다. 1~3라운드(요일·장소·메뉴)는 셋 모두 고른 것을, 4라운드(버스)는 아무도 타지 않은 번호를 고릅니다.
            라운드 후반(6번째 문항부터)은 한 사람이 보여 주는 것이 3개에서 4개로 늘어납니다.
          </p>

          <RealModeToggle checked={real} onChange={(e) => setSettings((p) => ({ ...p, isRealMode: e.target.checked }))} />
          {real && <p className="text-sm text-center font-bold">실전: 4라운드 × 10문항 · 한 사람 1초 · 응답 3초 · 정답 비공개</p>}

          <fieldset disabled={real} className={`space-y-6 ${real ? 'opacity-40' : ''}`}>
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

            <NumberInput id="presentationTime" name="presentationTime" label="한 사람 제시 시간 (초, 실전 1초)"
              value={settings.presentationTimeMs / 1000} min={1} max={5} step={0.5}
              onChange={(e) => setSettings((prev) => ({ ...prev, presentationTimeMs: Number(e.target.value) * 1000 }))} />

            <NumberInput id="responseTimeLimit" name="responseTimeLimit" label="응답 제한 시간 (초, 실전 3초)"
              value={settings.responseTimeLimitMs / 1000} min={2} max={15}
              onChange={(e) => setSettings((prev) => ({ ...prev, responseTimeLimitMs: Number(e.target.value) * 1000 }))} />
          </fieldset>

          {error && <p className="text-danger text-sm text-center">{error}</p>}

          <Button type="submit" className="w-full">게임 시작</Button>
        </form>
      </div>
    </PageLayout>
  );
}
