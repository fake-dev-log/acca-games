import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { types } from '@wails/go/models';
import { useNumberPressingStore } from '@stores/numberPressingStore';
import { RecordPageLayout } from '@layout/RecordPageLayout';
import { SessionList } from '@components/records/SessionList';
import { ResultsTable, Column } from '@components/records/ResultsTable';
import { Card } from '@components/common/Card';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function NumberPressingSessionDetail() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const {
    sessions,
    currentSessionResultsR1,
    currentSessionResultsR2,
    loading,
    error,
    fetchResultsForSession,
    fetchSessions,
  } = useNumberPressingStore();

  useEffect(() => {
    if (sessionId) {
      fetchResultsForSession(parseInt(sessionId));
      if (sessions.length === 0) {
        fetchSessions();
      }
    }
  }, [sessionId, fetchResultsForSession, fetchSessions, sessions.length]);

  const sessionInfo = sessions.find((s: types.GameSession) => s.id === parseInt(sessionId!));

  const handleSessionClick = (id: number) => {
    navigate(`/records/number-pressing/${id}`);
  };

  if (loading) {
    return <RecordPageLayout backPath="/records/number-pressing" title="세션 상세 기록" sidebarContent={<SessionList sessions={sessions} loading={loading} error={error} onSessionClick={handleSessionClick} activeSessionId={parseInt(sessionId!)} />}><p>세션 상세 정보를 불러오는 중...</p></RecordPageLayout>;
  }
  if (error) {
    return <RecordPageLayout backPath="/records/number-pressing" title="세션 상세 기록" sidebarContent={<SessionList sessions={sessions} loading={loading} error={error} onSessionClick={handleSessionClick} activeSessionId={parseInt(sessionId!)} />}><p className="text-red-500">{error}</p></RecordPageLayout>;
  }
  if (!sessionInfo) {
    return <RecordPageLayout backPath="/records/number-pressing" title="세션 상세 기록" sidebarContent={<SessionList sessions={sessions} loading={loading} error={error} onSessionClick={handleSessionClick} activeSessionId={parseInt(sessionId!)} />}><p>세션을 찾을 수 없습니다.</p></RecordPageLayout>;
  }

  const totalTrialsR1 = currentSessionResultsR1.length;
  const correctTrialsR1 = currentSessionResultsR1.filter(r => r.isCorrect).length;
  const totalTrialsR2 = currentSessionResultsR2.length;
  const correctTrialsR2 = currentSessionResultsR2.filter(r => r.isCorrect).length;

  const totalTrials = totalTrialsR1 + totalTrialsR2;
  const correctTrials = correctTrialsR1 + correctTrialsR2;
  const overallAccuracy = totalTrials > 0 ? (correctTrials / totalTrials) * 100 : 0;

  const avgResponseTimeR1 = totalTrialsR1 > 0 ? (currentSessionResultsR1.reduce((sum, r) => sum + r.timeTaken, 0) / totalTrialsR1) : 0;
  const avgResponseTimeR2 = totalTrialsR2 > 0 ? (currentSessionResultsR2.reduce((sum, r) => sum + r.timeTaken, 0) / totalTrialsR2) : 0;

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
    labels: ['1라운드', '2라운드'],
    datasets: [{
      label: '정확도 (%)',
      data: [
        totalTrialsR1 > 0 ? (correctTrialsR1 / totalTrialsR1) * 100 : 0,
        totalTrialsR2 > 0 ? (correctTrialsR2 / totalTrialsR2) * 100 : 0,
      ],
      backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)'],
    }],
  };

  const responseTimeByRoundData = {
    labels: ['1라운드', '2라운드'],
    datasets: [{
      label: '평균 반응 시간 (초)',
      data: [avgResponseTimeR1, avgResponseTimeR2],
      backgroundColor: ['rgba(255, 159, 64, 0.6)', 'rgba(54, 162, 235, 0.6)'],
    }],
  };

  const columnsR1: Column<types.NumberPressingResultR1>[] = [
    { header: '문제 번호', accessor: (row: types.NumberPressingResultR1, index: number) => index + 1 },
    { header: '타겟 숫자', accessor: (row: types.NumberPressingResultR1) => row.problem.targetNumber },
    { header: '정답 여부', accessor: (row: types.NumberPressingResultR1) => row.isCorrect ? 'O' : 'X' },
    { header: '반응 시간 (초)', accessor: (row: types.NumberPressingResultR1) => row.timeTaken.toFixed(2) },
  ];

  const columnsR2: Column<types.NumberPressingResultR2>[] = [
    { header: '문제 번호', accessor: (row: types.NumberPressingResultR2, index: number) => index + 1 },
    { header: '두 번 클릭', accessor: (row: types.NumberPressingResultR2) => row.problem.doubleClick.join(', ') || '없음' },
    { header: '건너뛰기', accessor: (row: types.NumberPressingResultR2) => row.problem.skip.join(', ') || '없음' },
    { header: '플레이어 클릭', accessor: (row: types.NumberPressingResultR2) => row.playerClicks.join(', ') },
    { header: '정답 클릭', accessor: (row: types.NumberPressingResultR2) => row.correctClicks.join(', ') },
    { header: '정답 여부', accessor: (row: types.NumberPressingResultR2) => row.isCorrect ? 'O' : 'X' },
    { header: '반응 시간 (초)', accessor: (row: types.NumberPressingResultR2) => row.timeTaken.toFixed(2) },
  ];

  return (
    <RecordPageLayout backPath="/records/number-pressing" title={`세션 상세 기록 (ID: ${sessionId})`} sidebarContent={<SessionList sessions={sessions} loading={loading} error={error} onSessionClick={handleSessionClick} activeSessionId={parseInt(sessionId!)} />}>
      <div className="space-y-6">
        <Card title="요약 정보">
          <p>총 문제 수: {totalTrials}</p>
          <p>정답 수: {correctTrials}</p>
          <p>전체 정확도: {overallAccuracy.toFixed(2)}%</p>
          <p>1라운드 평균 반응 시간: {avgResponseTimeR1.toFixed(2)} 초</p>
          <p>2라운드 평균 반응 시간: {avgResponseTimeR2.toFixed(2)} 초</p>
        </Card>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card><Bar data={accuracyByRoundData} options={chartOptions('라운드별 정확도', '정확도 (%)')} /></Card>
          <Card><Bar data={responseTimeByRoundData} options={chartOptions('라운드별 평균 반응 시간', '시간 (초)')} /></Card>
        </div>
        
        {totalTrialsR1 > 0 && (
          <Card title="1라운드 상세 기록">
            <ResultsTable columns={columnsR1} data={currentSessionResultsR1} />
          </Card>
        )}

        {totalTrialsR2 > 0 && (
          <Card title="2라운드 상세 기록">
            <ResultsTable columns={columnsR2} data={currentSessionResultsR2} />
          </Card>
        )}
      </div>
    </RecordPageLayout>
  );
}
