import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { types } from '@wails/go/models';
import { RecordPageLayout } from '@layout/RecordPageLayout';
import { SessionList } from '@components/records/SessionList';
import { parseSettings } from '@utils/nbackHelpers';
import { useNBackSessions } from '@hooks/useNBackSessions'; // Import the custom hook

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export function NBackRecords() {
  const navigate = useNavigate();
  const { sessions, allResults, loading, error } = useNBackSessions(); // Use the custom hook
  const [filterLevel, setFilterLevel] = useState<number | 'all'>('all');
  const [filterShapeGroup, setFilterShapeGroup] = useState<string | 'all'>('all');

  // Helper function to calculate accuracy for a session
  const calculateSessionAccuracy = (session: types.GameSession, results: types.NBackRecord[]) => {
    const sessionSpecificResults = results.filter(r => r.sessionId === session.sessionId);
    if (sessionSpecificResults.length === 0) return 0;
    const correctCount = sessionSpecificResults.filter(r => r.isCorrect).length;
    return (correctCount / sessionSpecificResults.length) * 100;
  };

  const handleSessionClick = (sessionId: number) => {
    navigate(`/records/n-back/${sessionId}`); // Navigate to detail page
  };

  const filteredSessions = sessions.filter(session => {
    const settings = parseSettings(session.settings);
    if (!settings) return false;

    const levelMatch = filterLevel === 'all' || settings.nBackLevel === filterLevel;
    const shapeGroupMatch = filterShapeGroup === 'all' || settings.shapeGroup === filterShapeGroup;
    return levelMatch && shapeGroupMatch;
  });

  const chartData = {
    labels: filteredSessions.map(session => new Date(session.playDatetime).toLocaleString()),
    datasets: [
      {
        label: '정확도 (%)',
        data: filteredSessions.map(session => calculateSessionAccuracy(session, allResults)),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '세션별 정확도 추이',
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        title: {
          display: true,
          text: '정확도 (%)',
        },
      },
      x: {
        title: {
          display: true,
          text: '플레이 시간',
        },
      },
    },
  };

  const uniqueShapeGroups = Array.from(new Set(sessions.map(s => parseSettings(s.settings)?.shapeGroup))).filter(Boolean) as string[];

  return (
    <RecordPageLayout backPath="/records" title="N-Back 게임 기록" sidebarContent={<SessionList onSessionClick={handleSessionClick} />}>
      <h2 className="text-2xl font-bold mb-4">대시보드</h2>
      <div className="mb-4 flex space-x-4">
        <div>
          <label htmlFor="filterLevel" className="block text-sm font-medium text-on-surface">라운드 필터:</label>
          <select id="filterLevel" value={filterLevel} onChange={e => setFilterLevel(Number(e.target.value) || 'all')} className="mt-1 block w-full p-2 border rounded-md bg-background text-foreground">
            <option value="all">모두</option>
            <option value={1}>1라운드 (2-back)</option>
            <option value={2}>2라운드 (2 & 3-back)</option>
          </select>
        </div>
        <div>
          <label htmlFor="filterShapeGroup" className="block text-sm font-medium text-on-surface">도형 그룹 필터:</label>
          <select id="filterShapeGroup" value={filterShapeGroup} onChange={e => setFilterShapeGroup(e.target.value)} className="mt-1 block w-full p-2 border rounded-md bg-background text-foreground">
            <option value="all">모두</option>
            {uniqueShapeGroups.map(group => (
              <option key={group} value={group}>{group === 'random' ? '랜덤' : `${group.replace('group', '')}번 세트`}</option>
            ))}
          </select>
        </div>
      </div>
      
      {loading && <p>데이터를 불러오는 중...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && filteredSessions.length === 0 && <p>필터링된 세션 데이터가 없습니다.</p>}
      
      <div className="mt-8 flex-grow flex items-center justify-center">
        <Line data={chartData} options={chartOptions} />
      </div>
    </RecordPageLayout>
  );
}
