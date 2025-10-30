import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { types } from '@wails/go/models';
import { GetShapeGroups, StartNBackGame } from '@wails/go/main/App';
import { ShapeSetButton } from '@components/game_setup/ShapeSetButton';

export function NBackGameSetup() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<types.NBackSettings>({
    numTrials: 25,
    presentationTime: 3000, // ms
    nBackLevel: 1,
    shapeGroup: 'random',
    isRealMode: false,
  });
  const [availableGroups, setAvailableGroups] = useState<{ [key: string]: string[] }>({});
  const [error, setError] = useState('');

  useEffect(() => {
    GetShapeGroups().then(setAvailableGroups).catch(console.error);
  }, []);

  const handleStartGame = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const plainSettings = { ...settings };
      const gameState = await StartNBackGame(plainSettings);
      navigate('/games/n-back/play', { state: { gameState } });
    } catch (err: any) {
      console.error('Error starting game:', err);
      setError('게임을 시작하는 중 오류가 발생했습니다.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev: types.NBackSettings) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  const handleLevelChange = (level: number) => {
    setSettings(prev => ({ ...prev, nBackLevel: level }));
  };

  const handleGroupChange = (group: string) => {
    setSettings(prev => ({ ...prev, shapeGroup: group }));
  };
  
  const presentationTimeInSeconds = settings.presentationTime / 1000;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative p-4">
      <button onClick={() => navigate('/games')} className="absolute top-4 left-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
        뒤로가기
      </button>
      <div className="w-full max-w-lg mx-auto p-4">
        <h1 className="text-3xl font-bold mb-8 text-center">도형 순서 기억하기 설정</h1>
        <form onSubmit={handleStartGame} className="space-y-6">
          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">라운드 선택</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleLevelChange(1)}
                className={`py-3 px-4 rounded-lg transition-colors text-base ${settings.nBackLevel === 1 ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>
                1라운드 (2-back)
              </button>
              <button
                type="button"
                onClick={() => handleLevelChange(2)}
                className={`py-3 px-4 rounded-lg transition-colors text-base ${settings.nBackLevel === 2 ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>
                2라운드 (2 & 3-back)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-base font-medium text-gray-700 mb-2">도형 세트 선택</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <ShapeSetButton
                groupName="랜덤"
                shapes={[]}
                isSelected={settings.shapeGroup === 'random'}
                onClick={() => handleGroupChange('random')}
              />
              {Object.entries(availableGroups).map(([key, shapes]) => (
                <ShapeSetButton
                  key={key}
                  groupName={`${key.replace('group', '')}번 세트`}
                  shapes={shapes}
                  isSelected={settings.shapeGroup === key}
                  onClick={() => handleGroupChange(key)}
                />
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="numTrials" className="block text-base font-medium text-gray-700">
              문제 개수 (10-50)
            </label>
            <input
              type="number"
              id="numTrials"
              name="numTrials"
              min="10"
              max="50"
              value={settings.numTrials}
              onChange={handleInputChange}
              className="mt-2 block w-full p-3 text-base border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="presentationTime" className="block text-base font-medium text-gray-700">
              도형 제시 시간 (초, 1-10)
            </label>
            <input
              type="number"
              id="presentationTime"
              name="presentationTime"
              min="1"
              max="10"
              value={presentationTimeInSeconds}
              onChange={(e) => setSettings((prev: types.NBackSettings) => ({...prev, presentationTime: Number(e.target.value) * 1000}))}
              className="mt-2 block w-full p-3 text-base border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-center pt-2">
            <input
              id="isRealMode"
              name="isRealMode"
              type="checkbox"
              checked={settings.isRealMode}
              onChange={(e) => setSettings(prev => ({ ...prev, isRealMode: e.target.checked }))}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="isRealMode" className="ml-2 block text-base font-medium text-gray-700">
              실전 모드 (피드백 없음)
            </label>
          </div>
          
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button 
            type="submit"
            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            게임 시작
          </button>
        </form>
      </div>
    </div>
  );
}
