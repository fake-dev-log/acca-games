import { useState, FormEvent } from 'react';
import { usePotionStore } from '../stores/potionStore';
import { PotionSettings } from '../logic/types';
import { REAL_SETTINGS } from '../logic/PotionEngine';
import { PageLayout } from '@components/layout/PageLayout';
import { Button } from '@components/common/Button';
import { RealModeToggle } from '@components/common/RealModeToggle';
import { NumberInput } from '@components/common/NumberInput';

export function PotionGameSetup() {
  const { error, startGame } = usePotionStore();
  const [settings, setSettings] = useState<PotionSettings>({ ...REAL_SETTINGS, numTrials: 40, isRealMode: false });
  const real = settings.isRealMode;

  const handleStartGame = (e: FormEvent) => {
    e.preventDefault();
    startGame(real ? REAL_SETTINGS : settings);
  };

  return (
    <PageLayout backPath="/games" title="마법약 만들기 설정">
      <div className="w-full max-w-lg mx-auto p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg">
        <form onSubmit={handleStartGame} className="space-y-6">
          <p className="text-sm opacity-80 leading-relaxed">
            공개된 재료 카드 조합을 보고 나올 가능성이 높은 약을 고릅니다(← 파란 약 · → 빨간 약, 3초). 카드 하나하나가 아니라 조합 전체가 색을 정합니다.
            결과는 확률이라 가끔 반대 색이 나오고, 중간에 예고 없이 일부 조합의 레시피가 바뀝니다. 매 문제 만들어진 약이 공개되니 그걸로 익히세요.
          </p>

          <RealModeToggle checked={real} onChange={(e) => setSettings((p) => ({ ...p, isRealMode: e.target.checked }))} />
          {real && <p className="text-sm text-center font-bold">실전: 100문항 · 문항당 3초</p>}

          <fieldset disabled={real} className={`space-y-6 ${real ? 'opacity-40' : ''}`}>
            <NumberInput id="numTrials" name="numTrials" label="문제 수 (20-100, 40 이상 권장)" value={settings.numTrials} min={20} max={100}
              onChange={(e) => setSettings((p) => ({ ...p, numTrials: Number(e.target.value) }))} />

            <NumberInput id="responseTimeLimit" name="responseTimeLimit" label="응답 제한 시간 (초, 실전 3초)"
              value={settings.responseTimeLimitMs / 1000} min={2} max={5} step={0.5}
              onChange={(e) => setSettings((p) => ({ ...p, responseTimeLimitMs: Number(e.target.value) * 1000 }))} />

            <NumberInput id="dominantProbability" name="dominantProbability" label="우세 색이 나올 확률 (%, 60-95)"
              value={Math.round(settings.dominantProbability * 100)} min={60} max={95} step={5}
              onChange={(e) => setSettings((p) => ({ ...p, dominantProbability: Number(e.target.value) / 100 }))} />

            <div className="flex items-center justify-center">
              <input id="recipeChange" type="checkbox" checked={settings.recipeChange} className="h-4 w-4"
                onChange={(e) => setSettings((p) => ({ ...p, recipeChange: e.target.checked }))} />
              <label htmlFor="recipeChange" className="ml-2 text-base font-medium">중간에 레시피 바꾸기</label>
            </div>
            <p className="text-sm opacity-70 text-center">연습 모드에서는 같은 조합인데 지난번과 다른 약이 나오면 표시해 줍니다.</p>
          </fieldset>

          {error && <p className="text-danger text-sm text-center">{error}</p>}

          <Button type="submit" className="w-full">게임 시작</Button>
        </form>
      </div>
    </PageLayout>
  );
}
