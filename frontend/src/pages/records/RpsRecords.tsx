import { useState, useEffect } from 'react';
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
  const { sessions, loading, error, fetchSessions } = useRpsStore();

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleSessionClick = (sessionId: number) => {
    navigate(`/records/rps/${sessionId}`);
  };

  // Note: Accuracy calculation for RPS might need a different approach
  // as there is no single 'allResults' equivalent yet.
  // This is a placeholder.
  const chartData = {
    labels: sessions.map(session => new Date(session.playDatetime).toLocaleString()),
    datasets: [
      {
        label: '정확도 (%)',
        data: sessions.map(() => 0), // Placeholder data
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
      title: { display: true, text: '세션별 정확도 추이 (구현 예정)' },
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
