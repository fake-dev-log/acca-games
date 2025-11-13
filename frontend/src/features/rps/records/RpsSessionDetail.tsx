import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { types } from '@wails/go/models';
import { useRpsStore } from '../stores/rpsStore';
import { RecordPageLayout } from '@layout/RecordPageLayout';
import { SessionList } from '@components/records/SessionList';
import { ResultsTable, Column } from '@components/records/ResultsTable';
import { Card } from '@components/common/Card';
import { GameCodeSlugs } from '@constants/gameCodes';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function RpsSessionDetail() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { paginatedSessions, loading, error, fetchPaginatedSessions } = useRpsStore();
  const sessionsWithResults = paginatedSessions.sessions;

  useEffect(() => {
    if (sessionsWithResults.length === 0) {
      fetchPaginatedSessions(1, 10);
    }
  }, [sessionsWithResults.length, fetchPaginatedSessions]);

  const currentSession = sessionsWithResults.find(s => s.id === parseInt(sessionId!));
  const sessionResults = currentSession?.results || [];
  const sessionsForList = sessionsWithResults.map(({ results, ...sessionInfo }) => sessionInfo);

  const handleSessionClick = (id: number) => {
    navigate(`/records/${GameCodeSlugs.RPS}/${id}`);
  };

  const sidebar = <SessionList sessions={sessionsForList} loading={loading} error={error} onSessionClick={handleSessionClick} activeSessionId={parseInt(sessionId!)} />;

  if (loading && !currentSession) {
    return <RecordPageLayout backPath={`/records/${GameCodeSlugs.RPS}`} title="세션 상세 기록" sidebarContent={sidebar}><p>세션 상세 정보를 불러오는 중...</p></RecordPageLayout>;
  }
  if (error) {
    return <RecordPageLayout backPath={`/records/${GameCodeSlugs.RPS}`} title="세션 상세 기록" sidebarContent={sidebar}><p className="text-red-500">{error}</p></RecordPageLayout>;
  }
  if (!currentSession) {
    return <RecordPageLayout backPath={`/records/${GameCodeSlugs.RPS}`} title="세션 상세 기록" sidebarContent={sidebar}><p>세션을 찾을 수 없습니다.</p></RecordPageLayout>;
  }

  const totalTrials = sessionResults.length;
  const correctTrials = sessionResults.filter(r => r.isCorrect).length;
  const overallAccuracy = totalTrials > 0 ? (correctTrials / totalTrials) * 100 : 0;
  const avgResponseTime = totalTrials > 0 ? (sessionResults.reduce((sum, r) => sum + r.responseTimeMs, 0) / totalTrials) : 0;

  const chartOptions = (title: string, yLabel: string) => ({
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: title },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: yLabel } },
    },
  });

  const accuracyByRoundData = {
    labels: [...new Set(sessionResults.map(r => `라운드 ${r.round}`))] as string[],
    datasets: [{
      label: '정확도 (%)',
      data: [...new Set(sessionResults.map(r => r.round))].map(round => {
        const roundResults = sessionResults.filter(r => r.round === round);
        const roundCorrect = roundResults.filter(r => r.isCorrect).length;
        return roundResults.length > 0 ? (roundCorrect / roundResults.length) * 100 : 0;
      }),
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
    }],
  };

  const responseTimeByRoundData = {
    labels: [...new Set(sessionResults.map(r => `라운드 ${r.round}`))] as string[],
    datasets: [{
      label: '평균 반응 시간 (ms)',
      data: [...new Set(sessionResults.map(r => r.round))].map(round => {
        const roundResults = sessionResults.filter(r => r.round === round);
        return roundResults.length > 0 ? (roundResults.reduce((sum, r) => sum + r.responseTimeMs, 0) / roundResults.length) : 0;
      }),
      backgroundColor: 'rgba(255, 159, 64, 0.6)',
    }],
  };

  const columns: Column<types.RpsResult>[] = [
    { header: '문제 번호', accessor: (row: types.RpsResult) => row.questionNum },
    { header: '라운드', accessor: (row: types.RpsResult) => row.round },
    { header: '제시 카드', accessor: (row: types.RpsResult) => row.givenCard },
    { header: '정답 카드', accessor: (row: types.RpsResult) => row.correctChoice },
    { header: '플레이어 선택', accessor: (row: types.RpsResult) => row.playerChoice },
    { header: '정답 여부', accessor: (row: types.RpsResult) => row.isCorrect ? 'O' : 'X' },
    { header: '반응 시간 (ms)', accessor: (row: types.RpsResult) => row.responseTimeMs },
  ];

  return (
    <RecordPageLayout backPath={`/records/${GameCodeSlugs.RPS}`} title={`세션 상세 기록 (ID: ${sessionId})`} sidebarContent={sidebar}>
      <div className="space-y-6">
        <Card title="요약 정보">
          <p>총 문제 수: {totalTrials}</p>
          <p>정답 수: {correctTrials}</p>
          <p>전체 정확도: {overallAccuracy.toFixed(2)}%</p>
          <p>평균 반응 시간: {avgResponseTime.toFixed(2)} ms</p>
        </Card>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card><Bar data={accuracyByRoundData} options={chartOptions('라운드별 정확도', '정확도 (%)')} /></Card>
          <Card><Bar data={responseTimeByRoundData} options={chartOptions('라운드별 평균 반응 시간', '시간 (ms)')} /></Card>
        </div>
        <Card title="상세 기록">
          <ResultsTable columns={columns} data={sessionResults} />
        </Card>
      </div>
    </RecordPageLayout>
  );
}