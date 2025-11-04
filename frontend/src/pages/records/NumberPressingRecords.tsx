import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { types } from '@wails/go/models';
import { RecordPageLayout } from '@layout/RecordPageLayout';
import { SessionList } from '@components/records/SessionList';
import { useNumberPressingStore } from '@stores/numberPressingStore';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export function NumberPressingRecords() {
  const navigate = useNavigate();
  const { sessions, allResultsR1, allResultsR2, loading, error, fetchSessions, fetchAllResults } = useNumberPressingStore();

  useEffect(() => {
    fetchSessions();
    fetchAllResults();
  }, [fetchSessions, fetchAllResults]);

  const handleSessionClick = (sessionId: number) => {
    navigate(`/records/number-pressing/${sessionId}`);
  };

  const calculateSessionAccuracy = (session: types.GameSession) => {
    const sessionSpecificResultsR1 = allResultsR1.filter(r => r.sessionID === session.id);
    const sessionSpecificResultsR2 = allResultsR2.filter(r => r.sessionID === session.id);
    const totalResults = sessionSpecificResultsR1.length + sessionSpecificResultsR2.length;

    if (totalResults === 0) return 0;

    const correctCountR1 = sessionSpecificResultsR1.filter(r => r.isCorrect).length;
    const correctCountR2 = sessionSpecificResultsR2.filter(r => r.isCorrect).length;

    return ((correctCountR1 + correctCountR2) / totalResults) * 100;
  };

  // Sort sessions by playDatetime in ascending order for chart display
  const sortedSessions = [...sessions].sort((a, b) => new Date(a.playDatetime).getTime() - new Date(b.playDatetime).getTime());

  const chartData = {
    labels: sortedSessions.map(session => new Date(session.playDatetime).toLocaleString()),
    datasets: [
      {
        label: '정확도 (%)',
        data: sortedSessions.map(session => calculateSessionAccuracy(session)),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: '세션별 정확도 추이' },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
      },
    },
  };

  return (
    <RecordPageLayout backPath="/records" title="숫자 누르기 게임 기록" sidebarContent={<SessionList sessions={sessions} loading={loading} error={error} onSessionClick={handleSessionClick} />}>
      <h2 className="text-2xl font-bold mb-4">대시보드</h2>
      {loading && <p>데이터를 불러오는 중...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div className="mt-8 flex-grow flex items-center justify-center">
        {sessions.length > 0 ? <Line data={chartData} options={chartOptions} /> : <p>표시할 기록이 없습니다.</p>}
      </div>
    </RecordPageLayout>
  );
}
