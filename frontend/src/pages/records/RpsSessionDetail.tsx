import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { types } from '@wails/go/models';
import { useRpsStore } from '@stores/rpsStore';
import { RecordPageLayout } from '@layout/RecordPageLayout';
import { SessionList } from '@components/records/SessionList';
import { ResultsTable, Column } from '@components/records/ResultsTable';
import { Card } from '@components/common/Card';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function RpsSessionDetail() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const {
    sessions,
    currentSessionResults: sessionResults,
    loading,
    error,
    fetchResultsForSession,
    fetchSessions,
  } = useRpsStore();

  useEffect(() => {
    if (sessionId) {
      fetchResultsForSession(parseInt(sessionId));
      if (sessions.length === 0) {
        fetchSessions();
      }
    }
  }, [sessionId, fetchResultsForSession, fetchSessions, sessions.length]);

  const sessionInfo = sessions.find((s: types.GameSession) => s.sessionId === parseInt(sessionId!));

  const handleSessionClick = (id: number) => {
    navigate(`/records/rps/${id}`);
  };

  if (loading) {
    return <RecordPageLayout backPath="/records/rps" title="세션 상세 기록" sidebarContent={<SessionList sessions={sessions} loading={loading} error={error} onSessionClick={handleSessionClick} />}><p>세션 상세 정보를 불러오는 중...</p></RecordPageLayout>;
  }
  if (error) {
    return <RecordPageLayout backPath="/records/rps" title="세션 상세 기록" sidebarContent={<SessionList sessions={sessions} loading={loading} error={error} onSessionClick={handleSessionClick} />}><p className="text-red-500">{error}</p></RecordPageLayout>;
  }
  if (!sessionInfo) {
    return <RecordPageLayout backPath="/records/rps" title="세션 상세 기록" sidebarContent={<SessionList sessions={sessions} loading={loading} error={error} onSessionClick={handleSessionClick} />}><p>세션을 찾을 수 없습니다.</p></RecordPageLayout>;
  }

  const totalTrials = sessionResults.length;
  const correctTrials = sessionResults.filter(r => r.isCorrect).length;
  const overallAccuracy = totalTrials > 0 ? (correctTrials / totalTrials) * 100 : 0;
  const avgResponseTime = totalTrials > 0 ? (sessionResults.reduce((sum, r) => sum + r.responseTimeMs, 0) / totalTrials).toFixed(2) : 'N/A';

  const calculateAccuracyByRound = (round: number) => {
    const roundResults = sessionResults.filter(r => r.round === round);
    if (roundResults.length === 0) return 0;
    const correctCount = roundResults.filter(r => r.isCorrect).length;
    return (correctCount / roundResults.length) * 100;
  };

  const calculateAvgResponseTimeByRound = (round: number) => {
    const roundResults = sessionResults.filter(r => r.round === round);
    if (roundResults.length === 0) return 0;
    const totalResponseTime = roundResults.reduce((sum, r) => sum + r.responseTimeMs, 0);
    return totalResponseTime / roundResults.length;
  };

  const calculateAccuracyByPerspective = (holder: 'me' | 'opponent') => {
    const perspectiveResults = sessionResults.filter(r => r.problemCardHolder === holder);
    if (perspectiveResults.length === 0) return 0;
    const correctCount = perspectiveResults.filter(r => r.isCorrect).length;
    return (correctCount / perspectiveResults.length) * 100;
  };

  const accuracyByRoundData = {
    labels: ['1라운드', '2라운드', '3라운드'],
    datasets: [{
      label: '정확도 (%)',
      data: [1, 2, 3].map(calculateAccuracyByRound),
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
    }],
  };

  const responseTimeByRoundData = {
    labels: ['1라운드', '2라운드', '3라운드'],
    datasets: [{
      label: '평균 반응 시간 (ms)',
      data: [1, 2, 3].map(calculateAvgResponseTimeByRound),
      backgroundColor: 'rgba(255, 159, 64, 0.6)',
    }],
  };

  const accuracyByPerspectiveData = {
    labels: ['내가 선택 (상대 카드 공개)', '상대가 선택 (내 카드 공개)'],
    datasets: [{
      label: '정확도 (%)',
      data: [calculateAccuracyByPerspective('me'), calculateAccuracyByPerspective('opponent')],
      backgroundColor: ['rgba(153, 102, 255, 0.6)', 'rgba(54, 162, 235, 0.6)'],
    }],
  };

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

  const columns: Column<types.RpsResult>[] = [
    { header: '문제 번호', accessor: (row) => row.questionNum + 1 },
    { header: '라운드', accessor: (row) => row.round },
    { header: '제시된 카드', accessor: (row) => `${row.problemCardHolder === 'me' ? '상대' : '나'}: ${row.givenCard}` },
    { header: '플레이어 선택', accessor: (row) => row.playerChoice },
    { header: '정답', accessor: (row) => row.correctChoice },
    { header: '정답 여부', accessor: (row) => row.isCorrect ? 'O' : 'X' },
    { header: '반응 시간 (ms)', accessor: (row) => row.responseTimeMs },
  ];

  return (
    <RecordPageLayout backPath="/records/rps" title={`세션 상세 기록 (ID: ${sessionId})`} sidebarContent={<SessionList sessions={sessions} loading={loading} error={error} onSessionClick={handleSessionClick} />}>
      <div className="space-y-6">
        <Card title="요약 정보">
          <p>총 문제 수: {totalTrials}</p>
          <p>정답 수: {correctTrials}</p>
          <p>전체 정확도: {overallAccuracy.toFixed(2)}%</p>
          <p>평균 반응 시간: {avgResponseTime} ms</p>
        </Card>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card><Bar data={accuracyByRoundData} options={chartOptions('라운드별 정확도', '정확도 (%)')} /></Card>
          <Card><Bar data={responseTimeByRoundData} options={chartOptions('라운드별 평균 반응 시간', '시간 (ms)')} /></Card>
        </div>
        <Card><Bar data={accuracyByPerspectiveData} options={chartOptions('상황별 정확도', '정확도 (%)')} /></Card>
        <Card title="라운드별 상세 기록">
          <ResultsTable columns={columns} data={sessionResults} />
        </Card>
      </div>
    </RecordPageLayout>
  );
}
