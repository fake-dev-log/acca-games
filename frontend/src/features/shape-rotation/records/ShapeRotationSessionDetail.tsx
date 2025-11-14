import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { types } from '@wails/go/models';
import useShapeRotationStore from '../stores/shapeRotationStore';
import { RecordPageLayout } from '@components/layout/RecordPageLayout';
import { GameCodeSlugs } from '@constants/gameCodes';
import { SessionList } from '@components/records/SessionList';
import { ResultsTable, Column } from '@components/records/ResultsTable';
import { Card } from '@components/common/Card';
import { fetchShapeRotationSessionStats, ShapeRotationSessionStats } from '@api/stats'; // Import new API and interface

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function ShapeRotationSessionDetail() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const {
    paginatedSessions,
    loading,
    error,
    fetchPaginatedSessions,
  } = useShapeRotationStore();
  const sessionsWithResults = paginatedSessions.sessions;

  const [sessionStats, setSessionStats] = useState<ShapeRotationSessionStats | null>(null);
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
      fetchShapeRotationSessionStats(parseInt(sessionId))
        .then(stats => {
          setSessionStats(stats);
        })
        .catch(err => {
          console.error("Failed to fetch Shape Rotation session stats:", err);
          setStatsError("세션 통계를 불러오는데 실패했습니다.");
        })
        .finally(() => {
          setStatsLoading(false);
        });
    }
  }, [sessionId]);

  const currentSession = sessionsWithResults.find(s => s.id === Number(sessionId));
  const sessionResults = currentSession?.results || [];
  const sessionsForList = sessionsWithResults.map(({ results, ...sessionInfo }) => sessionInfo);

  const handleSessionClick = (id: number) => {
    navigate(`/records/${GameCodeSlugs.SHAPE_ROTATION}/${id}`);
  };

  const sidebar = <SessionList sessions={sessionsForList} loading={loading} error={error} onSessionClick={handleSessionClick} activeSessionId={parseInt(sessionId!)} />;

  if (loading && !currentSession || statsLoading && !sessionStats) {
    return <RecordPageLayout backPath={`/records/${GameCodeSlugs.SHAPE_ROTATION}`} title="세션 상세 기록" sidebarContent={sidebar}><p>세션 상세 정보를 불러오는 중...</p></RecordPageLayout>;
  }

  if (error || statsError) {
    return <RecordPageLayout backPath={`/records/${GameCodeSlugs.SHAPE_ROTATION}`} title="세션 상세 기록" sidebarContent={sidebar}><p className="text-red-500">{error || statsError}</p></RecordPageLayout>;
  }

  if (!currentSession || !sessionStats) {
    return <RecordPageLayout backPath={`/records/${GameCodeSlugs.SHAPE_ROTATION}`} title="세션 상세 기록" sidebarContent={sidebar}><p>세션을 찾을 수 없습니다.</p></RecordPageLayout>;
  }

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
    labels: sessionStats.roundStats.map(rs => `라운드 ${rs.round}`),
    datasets: [{
      label: '정확도 (%)',
      data: sessionStats.roundStats.map(rs => rs.accuracy),
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
    }],
  };

  const solveTimeByRoundData = {
    labels: sessionStats.roundStats.map(rs => `라운드 ${rs.round}`),
    datasets: [{
      label: '평균 풀이 시간 (초)',
      data: sessionStats.roundStats.map(rs => rs.averageSolveTimeMs / 1000), // Convert ms to seconds
      backgroundColor: 'rgba(255, 159, 64, 0.6)',
    }],
  };

  const clickCountByRoundData = {
    labels: sessionStats.roundStats.map(rs => `라운드 ${rs.round}`),
    datasets: [{
      label: '평균 클릭 수',
      data: sessionStats.roundStats.map(rs => rs.averageClickCount),
      backgroundColor: 'rgba(153, 102, 255, 0.6)',
    }],
  };

  const columns: Column<types.ShapeRotationResult>[] = [
    { header: '문제 ID', accessor: (row) => row.problemId },
    { header: '정답 여부', accessor: (row) => row.isCorrect ? 'O' : 'X' },
    { header: '풀이 시간 (초)', accessor: (row) => (row.solveTime / 1000).toFixed(2) },
    { header: '클릭 수', accessor: (row) => row.clickCount },
    { header: '유저 해답', accessor: (row) => row.userSolution.join(', ') },
  ];

  return (
    <RecordPageLayout backPath={`/records/${GameCodeSlugs.SHAPE_ROTATION}`} title={`세션 상세 기록 (ID: ${sessionId})`} sidebarContent={sidebar}>
      <div className="space-y-6">
        <Card title="요약 정보">
          <p>총 문제 수: {sessionStats.totalQuestions}</p>
          <p>정답 수: {sessionStats.totalCorrect}</p>
          <p>전체 정확도: {sessionStats.overallAccuracy.toFixed(2)}%</p>
          <p>평균 풀이 시간: {sessionStats.averageSolveTimeMs.toFixed(2)} ms ({ (sessionStats.averageSolveTimeMs / 1000).toFixed(2) } 초)</p>
          <p>평균 클릭 수: {sessionStats.averageClickCount.toFixed(2)}</p>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card><Bar data={accuracyByRoundData} options={chartOptions('라운드별 정확도', '정확도 (%)')} /></Card>
          <Card><Bar data={solveTimeByRoundData} options={chartOptions('라운드별 평균 풀이 시간', '시간 (초)')} /></Card>
          <Card><Bar data={clickCountByRoundData} options={chartOptions('라운드별 평균 클릭 수', '클릭 수')} /></Card>
        </div>

        <Card title="상세 기록">
          <ResultsTable columns={columns} data={sessionResults} />
        </Card>
      </div>
    </RecordPageLayout>
  );
}
