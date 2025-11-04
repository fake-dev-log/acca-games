import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { types } from '@wails/go/models';
import { RecordPageLayout } from '@layout/RecordPageLayout';
import { SessionList } from '@components/records/SessionList';
import { useRpsStore } from '@stores/rpsStore';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export function RpsRecords() {
  const navigate = useNavigate();
  const { sessions, allResults, loading, error, fetchSessions, fetchAllResults } = useRpsStore();

  useEffect(() => {
    fetchSessions();
    fetchAllResults();
  }, [fetchSessions, fetchAllResults]);

  const handleSessionClick = (sessionId: number) => {
    navigate(`/records/rps/${sessionId}`);
  };

  const calculateSessionAccuracy = (session: types.GameSession, results: types.RpsResult[]) => {
    const sessionSpecificResults = results.filter(r => r.sessionId === session.id);
    if (sessionSpecificResults.length === 0) return 0;
    const correctCount = sessionSpecificResults.filter(r => r.isCorrect).length;
    return (correctCount / sessionSpecificResults.length) * 100;
  };

  const sortedSessionsForChart = [...sessions].sort((a, b) => new Date(a.playDatetime).getTime() - new Date(b.playDatetime).getTime());

  const chartData = {
    labels: sortedSessionsForChart.map(session => new Date(session.playDatetime).toLocaleString()),
    datasets: [
      {
        label: '정확도 (%)',
        data: sortedSessionsForChart.map(session => calculateSessionAccuracy(session, allResults)),
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
    <RecordPageLayout backPath="/records" title="가위바위보 게임 기록" sidebarContent={<SessionList sessions={sessions} loading={loading} error={error} onSessionClick={handleSessionClick} />}>
      <h2 className="text-2xl font-bold mb-4">대시보드</h2>
      {loading && <p>데이터를 불러오는 중...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div className="mt-8 flex-grow flex items-center justify-center">
        <Line data={chartData} options={chartOptions} />
      </div>
    </RecordPageLayout>
  );
}
