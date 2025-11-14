import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { RecordPageLayout } from '@layout/RecordPageLayout';
import { SessionList } from '@components/records/SessionList';
import { Pagination } from '@components/common/Pagination';
import { GameCodeSlug } from '@constants/gameCodes';
import { BaseGameSessionWithResults, BaseGameSessionInfo } from '@type/common'; // Import the new base interface and BaseGameSessionInfo
import { Select } from '@components/common/Select'; // Import the Select component

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface GameRecordsDashboardProps<T extends BaseGameSessionWithResults> {
  gameCodeSlug: GameCodeSlug;
  gameTitle: string;
  useStoreHook: () => {
    paginatedSessions: { sessions: T[]; totalCount: number };
    loading: boolean;
    error: string | null;
    fetchPaginatedSessions: (page: number, limit: number) => void;
  };
  // New prop: a function that returns an object of metrics
  calculateSessionMetrics: (session: T) => { [key: string]: number };
  // New prop: options for the metric selector
  metricOptions: { value: string; label: string }[];
}

export function GameRecordsDashboard<T extends BaseGameSessionWithResults>({
  gameCodeSlug,
  gameTitle,
  useStoreHook,
  calculateSessionMetrics,
  metricOptions,
}: GameRecordsDashboardProps<T>) {
  const navigate = useNavigate();
  const { paginatedSessions, loading, error, fetchPaginatedSessions } = useStoreHook();
  const [currentPage, setCurrentPage] = useState(1);
  const sessionsPerPage = 10;
  const [selectedMetric, setSelectedMetric] = useState<string>(metricOptions[0]?.value || '');

  useEffect(() => {
    fetchPaginatedSessions(currentPage, sessionsPerPage);
  }, [fetchPaginatedSessions, currentPage]);

  const handleSessionClick = (sessionId: number) => {
    navigate(`/records/${gameCodeSlug}/${sessionId}`);
  };

  const sortedSessions = useMemo(() => {
    return [...paginatedSessions.sessions].sort((a, b) => new Date(String(a.playDatetime)).getTime() - new Date(String(b.playDatetime)).getTime());
  }, [paginatedSessions.sessions]);

  const chartData = useMemo(() => {
    return {
      labels: sortedSessions.map(session => new Date(String(session.playDatetime)).toLocaleString()),
      datasets: [
        {
          label: metricOptions.find(opt => opt.value === selectedMetric)?.label || selectedMetric,
          data: sortedSessions.map(session => calculateSessionMetrics(session)[selectedMetric]),
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
        },
      ],
    };
  }, [sortedSessions, calculateSessionMetrics, selectedMetric, metricOptions]);

  const chartOptions = useMemo(() => {
    const yAxisMax = selectedMetric.includes('Accuracy') ? 100 : undefined; // Set max to 100 for accuracy metrics
    return {
      responsive: true,
      plugins: {
        legend: { position: 'top' as const },
        title: { display: true, text: `${metricOptions.find(opt => opt.value === selectedMetric)?.label || selectedMetric} 추이` },
      },
      scales: {
        y: {
          min: 0,
          max: yAxisMax,
        },
      },
    };
  }, [selectedMetric, metricOptions]);

  const sessionsForList: BaseGameSessionInfo[] = paginatedSessions.sessions.map(({ results, ...sessionInfo }) => sessionInfo);
  const totalPages = Math.ceil(paginatedSessions.totalCount / sessionsPerPage);

  return (
    <RecordPageLayout backPath="/records" title={gameTitle} sidebarContent={<SessionList sessions={sessionsForList} loading={loading} error={error} onSessionClick={handleSessionClick} />}>
      <h2 className="text-2xl font-bold mb-4">대시보드</h2>
      {loading && <p>데이터를 불러오는 중...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div className="mt-4">
        <Select
          label="표시할 통계 선택"
          options={metricOptions}
          value={selectedMetric}
          onChange={(e) => setSelectedMetric(e.target.value)}
        />
      </div>
      <div className="mt-8 flex-grow flex items-center justify-center">
        {paginatedSessions.sessions.length > 0 && selectedMetric ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <p>표시할 기록이 없습니다.</p>
        )}
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
    </RecordPageLayout>
  );
}
