import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { types } from '@wails/go/models';
import { useNBackStore } from '@stores/nbackStore';
import { RecordPageLayout } from '@layout/RecordPageLayout';
import { SessionList } from '@components/records/SessionList';
import { ResultsTable, Column } from '@components/records/ResultsTable';
import { Card } from '@components/common/Card';
import { formatSettings } from '@utils/nbackHelpers'; // Import from nbackHelpers

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function NBackSessionDetail() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const {
    currentSessionResults: sessionResults,
    sessions,
    loading,
    error,
    fetchResultsForSession,
    fetchSessions,
  } = useNBackStore();

  useEffect(() => {
    if (sessionId) {
      fetchResultsForSession(parseInt(sessionId));
      if (sessions.length === 0) {
        fetchSessions(); // Fetch all sessions if not already in store
      }
    }
  }, [sessionId, fetchResultsForSession, fetchSessions, sessions.length]);

  const sessionInfo = sessions.find((s: types.GameSession) => s.sessionId === parseInt(sessionId!));

  const calculateAccuracyByRound = (round: number) => {
    const roundResults = sessionResults.filter((r: types.NBackRecord) => r.round === round);
    if (roundResults.length === 0) return 0;
    const correctCount = roundResults.filter((r: types.NBackRecord) => r.isCorrect).length;
    return (correctCount / roundResults.length) * 100;
  };

  const calculateAvgResponseTimeByRound = (round: number) => {
    const roundResults = sessionResults.filter((r: types.NBackRecord) => r.round === round);
    if (roundResults.length === 0) return 0;
    const totalResponseTime = roundResults.reduce((sum: number, r: types.NBackRecord) => sum + r.responseTimeMs, 0);
    return (totalResponseTime / roundResults.length);
  };

  const handleSessionClick = (id: number) => {
    navigate(`/records/n-back/${id}`);
  };

  if (loading) {
    return (
      <RecordPageLayout backPath="/records/n-back" title="세션 상세 기록" sidebarContent={<SessionList sessions={sessions} loading={loading} error={error} onSessionClick={handleSessionClick} />}>
        <p>세션 상세 정보를 불러오는 중...</p>
      </RecordPageLayout>
    );
  }

  if (error) {
    return (
      <RecordPageLayout backPath="/records/n-back" title="세션 상세 기록" sidebarContent={<SessionList sessions={sessions} loading={loading} error={error} onSessionClick={handleSessionClick} />}>
        <p className="text-red-500">{error}</p>
      </RecordPageLayout>
    );
  }

  if (!sessionInfo) {
    return (
      <RecordPageLayout backPath="/records/n-back" title="세션 상세 기록" sidebarContent={<SessionList sessions={sessions} loading={loading} error={error} onSessionClick={handleSessionClick} />}>
        <p>세션을 찾을 수 없습니다.</p>
      </RecordPageLayout>
    );
  }

  const totalTrials = sessionResults.length;
  const correctTrials = sessionResults.filter((r: types.NBackRecord) => r.isCorrect).length;
  const overallAccuracy = totalTrials > 0 ? (correctTrials / totalTrials) * 100 : 0;
  const avgResponseTime = totalTrials > 0 
    ? (sessionResults.reduce((sum: number, r: types.NBackRecord) => sum + r.responseTimeMs, 0) / totalTrials).toFixed(2) 
    : 'N/A';

  const accuracyChartData = {
    labels: ['2-back (라운드 1)', '3-back (라운드 2)'],
    datasets: [
      {
        label: '정확도 (%)',
        data: [calculateAccuracyByRound(1), calculateAccuracyByRound(2)],
        backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)'],
        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const accuracyChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'N-Back 레벨별 정답률' },
    },
    scales: {
      y: { beginAtZero: true, max: 100, title: { display: true, text: '정확도 (%)' } },
    },
  };

  const responseTimeChartData = {
    labels: ['2-back (라운드 1)', '3-back (라운드 2)'],
    datasets: [
      {
        label: '평균 반응 시간 (ms)',
        data: [calculateAvgResponseTimeByRound(1), calculateAvgResponseTimeByRound(2)],
        backgroundColor: ['rgba(255, 159, 64, 0.6)', 'rgba(54, 162, 235, 0.6)'],
        borderColor: ['rgba(255, 159, 64, 1)', 'rgba(54, 162, 235, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const responseTimeChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'N-Back 레벨별 평균 반응 시간' },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: '시간 (ms)' } },
    },
  };

  const columns: Column<types.NBackRecord>[] = [
    { header: '문제 번호', accessor: (row) => row.questionNum },
    { header: '라운드', accessor: (row) => row.round },
    { header: '플레이어 선택', accessor: (row) => row.playerChoice },
    { header: '정답', accessor: (row) => row.correctChoice },
    { header: '정답 여부', accessor: (row) => row.isCorrect ? 'O' : 'X' },
    { header: '반응 시간 (ms)', accessor: (row) => row.responseTimeMs },
  ];

  return (
    <RecordPageLayout backPath="/records/n-back" title={`세션 상세 기록 (ID: ${sessionId})`} sidebarContent={<SessionList sessions={sessions} loading={loading} error={error} onSessionClick={handleSessionClick} />}>
      <div className="space-y-6">
        <Card title="요약 정보">
          <p>총 문제 수: {totalTrials}</p>
          <p>정답 수: {correctTrials}</p>
          <p>전체 정확도: {overallAccuracy.toFixed(2)}%</p>
          <p>평균 반응 시간: {avgResponseTime} ms</p>
          {sessionInfo && <p>설정: {formatSettings(sessionInfo.settings)}</p>}
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <Bar data={accuracyChartData} options={accuracyChartOptions} />
          </Card>
          <Card>
            <Bar data={responseTimeChartData} options={responseTimeChartOptions} />
          </Card>
        </div>

        <Card title="라운드별 상세 기록">
          <ResultsTable columns={columns} data={sessionResults} />
        </Card>
      </div>
    </RecordPageLayout>
  );
}
