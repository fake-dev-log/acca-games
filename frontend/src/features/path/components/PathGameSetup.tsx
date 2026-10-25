import { useState, FormEvent } from 'react';
import { usePathStore } from '../stores/pathStore';
import { PathSettings } from '../logic/types';
import { REAL_SETTINGS } from '../logic/PathEngine';
import { PageLayout } from '@components/layout/PageLayout';
import { Button } from '@components/common/Button';
import { RealModeToggle } from '@components/common/RealModeToggle';
import { RoundButton } from '@components/game_setup/RoundButton';

const PRACTICE_TIMES: [number, string][] = [[180, '3분'], [300, '5분 (실전)'], [450, '7분 30초'], [0, '무제한']];

export function PathGameSetup() {
  const { error, startGame } = usePathStore();
  const [settings, setSettings] = useState<PathSettings>({ ...REAL_SETTINGS, isRealMode: false });
  const real = settings.isRealMode;
  const times = real ? PRACTICE_TIMES.slice(0, 2) : PRACTICE_TIMES; // 실전은 5분(또는 3분)

  const handleStartGame = (e: FormEvent) => {
    e.preventDefault();
    startGame(real ? { ...REAL_SETTINGS, timeLimitSec: settings.timeLimitSec || 300 } : settings);
  };

  return (
    <PageLayout backPath="/games" title="길 만들기 설정">
      <div className="w-full max-w-xl mx-auto p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg">
        <form onSubmit={handleStartGame} className="space-y-6">
          <p className="text-sm opacity-80 leading-relaxed">
            {settings.problemCount}문제를 풉니다 — 다 풀거나 시간이 끝나면 종료. 실제처럼 갈수록 어려워지고 쉬운 문제도 섞여 나옵니다.
            정답 울타리 수보다 많이 놓아 맞히면 '초과 설치' 로 기록됩니다.
          </p>

          <RealModeToggle checked={real}
            onChange={(e) => setSettings((p) => ({ ...p, isRealMode: e.target.checked, difficulty: 'normal', timeLimitSec: 300 }))} />
          <p className="text-sm text-center opacity-70">{real ? '실전: 보통 난이도 · 정답 비공개' : '연습: 틀리거나 초과한 문제는 정답 예시를 보여 줍니다'}</p>

          {!real && (
            <div>
              <label className="block text-base font-medium mb-2">난이도</label>
              <div className="grid grid-cols-2 gap-3">
                <RoundButton level={0} text="보통 (실제 시험과 비슷)" isSelected={settings.difficulty === 'normal'}
                  onClick={() => setSettings((p) => ({ ...p, difficulty: 'normal' }))} />
                <RoundButton level={0} text="어려움 (벽 많은 고난도만)" isSelected={settings.difficulty === 'hard'}
                  onClick={() => setSettings((p) => ({ ...p, difficulty: 'hard' }))} />
              </div>
            </div>
          )}

          <div>
            <label className="block text-base font-medium mb-2">제한 시간</label>
            <div className={`grid gap-3 ${real ? 'grid-cols-2' : 'grid-cols-4'}`}>
              {times.map(([sec, label]) => (
                <RoundButton key={sec} level={0} text={label} isSelected={settings.timeLimitSec === sec}
                  onClick={() => setSettings((p) => ({ ...p, timeLimitSec: sec }))} />
              ))}
            </div>
          </div>

          {error && <p className="text-danger text-sm text-center">{error}</p>}

          <Button type="submit" className="w-full">게임 시작</Button>
        </form>
      </div>
    </PageLayout>
  );
}
