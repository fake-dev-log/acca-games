import { useState, FormEvent } from 'react';
import { usePotionStore } from '../stores/potionStore';
import { PotionSettings } from '../logic/types';
import { PageLayout } from '@components/layout/PageLayout';
import { Button } from '@components/common/Button';
import { NumberInput } from '@components/common/NumberInput';

export function PotionGameSetup() {
  const { error, startGame } = usePotionStore();
  const [settings, setSettings] = useState<PotionSettings>({
    numTrials: 60,
    responseTimeLimitMs: 3000,
    dominantProbability: 0.8,
    recipeChange: true,
  });

  const handleStartGame = (e: FormEvent) => {
    e.preventDefault();
    startGame(settings);
  };

  return (
    <PageLayout backPath="/games" title="마법약 만들기 설정">
      <div className="w-full max-w-lg mx-auto p-4 bg-surface-light dark:bg-surface-dark rounded-lg shadow-lg">
        <form onSubmit={handleStartGame} className="space-y-6">
          <p className="text-sm opacity-80 leading-relaxed">
            공개된 재료 카드 조합을 보고 나올 가능성이 높은 약을 고릅니다. 결과는 확률이라 가끔 반대 색이 나오고,
            중간에 예고 없이 일부 조합의 레시피가 바뀝니다. 처음 본 조합과 바뀐 뒤 처음 본 조합은 채점하지 않습니다.
            결과로 규칙을 익히는 게임이라 연습·실전 구분 없이 매 문제 실제로 만들어진 약만 보여 줍니다.
          </p>

          <NumberInput id="numTrials" name="numTrials" label="문제 수 (20-120)" value={settings.numTrials} min={20} max={120}
            onChange={(e) => setSettings((p) => ({ ...p, numTrials: Number(e.target.value) }))} />

          <NumberInput id="responseTimeLimit" name="responseTimeLimit" label="응답 제한 시간 (초, 2-5)"
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

          {error && <p className="text-danger text-sm text-center">{error}</p>}

          <Button type="submit" className="w-full">게임 시작</Button>
        </form>
      </div>
    </PageLayout>
  );
}
