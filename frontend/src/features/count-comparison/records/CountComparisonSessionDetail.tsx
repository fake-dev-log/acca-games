import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { types } from '@wails/go/models';
import { useCountComparisonStore } from '@features/count-comparison/stores/countComparisonStore';
import { RecordPageLayout } from '@components/layout/RecordPageLayout';
import { SessionList } from '@components/records/SessionList';
import { ResultsTable, Column } from '@components/records/ResultsTable';
import { Card } from '@components/common/Card';
import { GameCodeSlugs } from '@constants/gameCodes';
import { fetchCountComparisonSessionStats } from '@api/stats';
import { formatAppliedTraps, getMetricLabel, formatTrapType } from '@utils/countComparisonHelpers';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function CountComparisonSessionDetail() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const {
    paginatedSessions,
    loading,
    error,
    fetchPaginatedSessions,
  } = useCountComparisonStore();

  const sessionsWithResults = paginatedSessions.sessions;

  const [sessionStats, setSessionStats] = useState<types.CountComparisonSessionStats | null>(null);
  const [statsLoading, setStatsLoading] = useState<boolean>(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionsWithResults.length === 0) {
      fetchPaginatedSessions(1, 10);
    }
  }, [sessionsWithResults.length, fetchPaginatedSessions]);

  useEffect(() => {
    if (sessionId) {
      setStatsLoading(true);
      setStatsError(null);
      fetchCountComparisonSessionStats(parseInt(sessionId))
        .then(stats => {
          setSessionStats(stats);
        })
        .catch(err => {
          console.error("Failed to fetch Count Comparison session stats:", err);
          setStatsError("세션 통계를 불러오는데 실패했습니다.");
        })
        .finally(() => {
          setStatsLoading(false);
        });
    }
  }, [sessionId]);

  const currentSession = sessionsWithResults.find((s) => s.id === parseInt(sessionId!));
  const sessionResults = currentSession?.results || [];
  const sessionsForList = sessionsWithResults.map(({ results, ...sessionInfo }) => sessionInfo);

  const handleSessionClick = (id: number) => {
    navigate(`/records/${GameCodeSlugs.COUNT_COMPARISON}/${id}`);
  };

  const sidebar = <SessionList sessions={sessionsForList} loading={loading} error={error} onSessionClick={handleSessionClick} activeSessionId={parseInt(sessionId!)} />;

  if (loading && !currentSession || statsLoading && !sessionStats) {
    return <RecordPageLayout backPath={`/records/${GameCodeSlugs.COUNT_COMPARISON}`} title="세션 상세 기록" sidebarContent={sidebar}><p>세션 상세 정보를 불러오는 중...</p></RecordPageLayout>;
  }

  if (error || statsError) {
    return <RecordPageLayout backPath={`/records/${GameCodeSlugs.COUNT_COMPARISON}`} title="세션 상세 기록" sidebarContent={sidebar}><p className="text-red-500">{error || statsError}</p></RecordPageLayout>;
  }

  if (!currentSession || !sessionStats) {
    return <RecordPageLayout backPath={`/records/${GameCodeSlugs.COUNT_COMPARISON}`} title="세션 상세 기록" sidebarContent={sidebar}><p>세션을 찾을 수 없습니다. 목록에서 다른 세션을 선택해주세요.</p></RecordPageLayout>;
  }

  const chartOptions = (title: string, yLabel: string, displayLegend: boolean = false) => ({
    responsive: true,
    plugins: {
      legend: { display: displayLegend },
      title: { display: true, text: title },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: yLabel } },
    },
  });

  const accuracyByTrapData = {
    labels: sessionStats.trapStats.map((ts: types.TrapStat) => formatTrapType(ts.trapType)),
    datasets: [
      {
        label: '정확도 (%)',
        data: sessionStats.trapStats.map((ts: types.TrapStat) => ts.accuracy),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const responseTimeByTrapData = {
    labels: sessionStats.trapStats.map((ts: types.TrapStat) => formatTrapType(ts.trapType)),
    datasets: [
      {
        label: '평균 반응 시간 (ms)',
        data: sessionStats.trapStats.map((ts: types.TrapStat) => ts.averageResponseTime),
        backgroundColor: 'rgba(255, 159, 64, 0.6)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1,
      },
    ],
  };

  const columns: Column<types.CountComparisonResult>[] = [
    { header: '문제 번호', accessor: (row) => row.problemNumber },
    { header: '왼쪽 단어', accessor: (row) => row.leftWord },
    { header: '오른쪽 단어', accessor: (row) => row.rightWord },
    { header: '왼쪽 개수', accessor: (row) => row.leftWordCount },
    { header: '오른쪽 개수', accessor: (row) => row.rightWordCount },
    { header: '플레이어 선택', accessor: (row) => row.playerChoice },
    { header: '정답', accessor: (row) => row.correctChoice },
    { header: '정답 여부', accessor: (row) => row.isCorrect ? 'O' : 'X' },
    { header: '반응 시간 (ms)', accessor: (row) => row.responseTimeMs },
    { header: '적용된 함정', accessor: (row) => formatAppliedTraps(row.appliedTraps) },
  ];

  return (
    <RecordPageLayout backPath={`/records/${GameCodeSlugs.COUNT_COMPARISON}`} title={`세션 상세 기록 (ID: ${sessionId})`} sidebarContent={sidebar}>
      <div className="space-y-6">
        <Card title="요약 정보">
          <p>총 문제 수: {sessionStats.totalQuestions}</p>
          <p>정답 수: {sessionStats.totalCorrect}</p>
          <p>전체 정확도: {sessionStats.overallAccuracy.toFixed(2)}%</p>
          <p>평균 반응 시간: {sessionStats.averageResponseTimeMs.toFixed(2)} ms</p>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <Bar data={accuracyByTrapData} options={chartOptions('함정별 정확도', '정확도 (%)')} />
          </Card>
          <Card>
            <Bar data={responseTimeByTrapData} options={chartOptions('함정별 평균 반응 시간', '시간 (ms)')} />
          </Card>
        </div>

        <Card title="문제별 상세 기록">
          <ResultsTable columns={columns} data={sessionResults} />
        </Card>
      </div>
    </RecordPageLayout>
  );
}
