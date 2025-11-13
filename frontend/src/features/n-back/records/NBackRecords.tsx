import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { types } from '@wails/go/models';
import { RecordPageLayout } from '@layout/RecordPageLayout';
import { SessionList } from '@components/records/SessionList';
import { useNBackStore } from '../stores/nbackStore';
import { GameCodeSlugs } from '@constants/gameCodes';
import { Pagination } from '@components/common/Pagination';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export function NBackRecords() {
  const navigate = useNavigate();
  const { paginatedSessions, loading, error, fetchPaginatedSessions } = useNBackStore();
  const [currentPage, setCurrentPage] = useState(1);
  const sessionsPerPage = 10;

  useEffect(() => {
    fetchPaginatedSessions(currentPage, sessionsPerPage);
  }, [fetchPaginatedSessions, currentPage]);

  const handleSessionClick = (sessionId: number) => {
    navigate(`/records/${GameCodeSlugs.N_BACK}/${sessionId}`);
  };

  const calculateSessionAccuracy = (session: types.NBackSessionWithResults) => {
    const totalResults = session.results.length;
    if (totalResults === 0) return 0;
    const correctCount = session.results.filter(r => r.isCorrect).length;
    return (correctCount / totalResults) * 100;
  };

  const sortedSessions = [...paginatedSessions.sessions].sort((a, b) => new Date(String(a.playDatetime)).getTime() - new Date(String(b.playDatetime)).getTime());

  const chartData = {
    labels: sortedSessions.map(session => new Date(String(session.playDatetime)).toLocaleString()),
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

  const sessionsForList = paginatedSessions.sessions.map(({ results, ...sessionInfo }) => sessionInfo);
  const totalPages = Math.ceil(paginatedSessions.totalCount / sessionsPerPage);

  return (
    <RecordPageLayout backPath="/records" title="N-Back 게임 기록" sidebarContent={<SessionList sessions={sessionsForList} loading={loading} error={error} onSessionClick={handleSessionClick} />}>
      <h2 className="text-2xl font-bold mb-4">대시보드</h2>
      {loading && <p>데이터를 불러오는 중...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div className="mt-8 flex-grow flex items-center justify-center">
        {paginatedSessions.sessions.length > 0 ? <Line data={chartData} options={chartOptions} /> : <p>표시할 기록이 없습니다.</p>}
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </RecordPageLayout>
  );
}
