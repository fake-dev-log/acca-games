import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { types } from '@wails/go/models';
import { useNumberPressingStore } from '../stores/numberPressingStore';
import { RecordPageLayout } from '@components/layout/RecordPageLayout';
import { SessionList } from '@components/records/SessionList';
import { ResultsTable, Column } from '@components/records/ResultsTable';
import { Card } from '@components/common/Card';
import { GameCodeSlugs } from '@constants/gameCodes';
import { fetchNumberPressingSessionStats, NumberPressingSessionStats } from '@api/stats'; // Import new API and interface

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function NumberPressingSessionDetail() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { paginatedSessions, loading, error, fetchPaginatedSessions } = useNumberPressingStore();
  const sessionsWithResults = paginatedSessions.sessions;

  const [sessionStats, setSessionStats] = useState<NumberPressingSessionStats | null>(null);
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
      fetchNumberPressingSessionStats(parseInt(sessionId))
        .then(stats => {
          setSessionStats(stats);
        })
        .catch(err => {
          console.error("Failed to fetch Number Pressing session stats:", err);
          setStatsError("세션 통계를 불러오는데 실패했습니다.");
        })
        .finally(() => {
          setStatsLoading(false);
        });
    }
  }, [sessionId]);

  const currentSession = sessionsWithResults.find(s => s.id === Number(sessionId));
  const resultsR1 = currentSession?.results.resultsR1 || [];
  const resultsR2 = currentSession?.results.resultsR2 || [];
  const sessionsForList = sessionsWithResults.map(({ results, ...sessionInfo }) => sessionInfo);

  const handleSessionClick = (id: number) => {
    navigate(`/records/${GameCodeSlugs.NUMBER_PRESSING}/${id}`);
  };

  const sidebar = <SessionList sessions={sessionsForList} loading={loading} error={error} onSessionClick={handleSessionClick} activeSessionId={parseInt(sessionId!)} />;

  if (loading && !currentSession || statsLoading && !sessionStats) {
    return <RecordPageLayout backPath={`/records/${GameCodeSlugs.NUMBER_PRESSING}`} title="세션 상세 기록" sidebarContent={sidebar}><p>세션 상세 정보를 불러오는 중...</p></RecordPageLayout>;
  }
  if (error || statsError) {
    return <RecordPageLayout backPath={`/records/${GameCodeSlugs.NUMBER_PRESSING}`} title="세션 상세 기록" sidebarContent={sidebar}><p className="text-red-500">{error || statsError}</p></RecordPageLayout>;
  }
  if (!currentSession || !sessionStats) {
    return <RecordPageLayout backPath={`/records/${GameCodeSlugs.NUMBER_PRESSING}`} title="세션 상세 기록" sidebarContent={sidebar}><p>세션을 찾을 수 없습니다.</p></RecordPageLayout>;
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

  const accuracyByRoundData = {
    labels: sessionStats.roundStats.map(rs => `라운드 ${rs.round}`),
    datasets: [{
      label: '정확도 (%)',
      data: sessionStats.roundStats.map(rs => rs.accuracy),
      backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)'],
    }],
  };

  const responseTimeByRoundData = {
    labels: sessionStats.roundStats.map(rs => `라운드 ${rs.round}`),
    datasets: [{
      label: '평균 반응 시간 (초)',
      data: sessionStats.roundStats.map(rs => rs.averageTimeTakenSec),
      backgroundColor: ['rgba(255, 159, 64, 0.6)', 'rgba(54, 162, 235, 0.6)'],
    }],
  };

  const round2Stats = sessionStats.roundStats.find(rs => rs.round === 2);

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
    <RecordPageLayout backPath={`/records/${GameCodeSlugs.NUMBER_PRESSING}`} title={`세션 상세 기록 (ID: ${sessionId})`} sidebarContent={sidebar}>
      <div className="space-y-6">
        <Card title="요약 정보">
          <p>총 문제 수: {sessionStats.totalQuestions}</p>
          <p>정답 수: {sessionStats.totalCorrect}</p>
          <p>전체 정확도: {sessionStats.overallAccuracy.toFixed(2)}%</p>
          {sessionStats.roundStats.map(rs => (
            <p key={`round-avg-time-${rs.round}`}>
              {rs.round}라운드 평균 반응 시간: {rs.averageTimeTakenSec.toFixed(2)} 초
            </p>
          ))}
        </Card>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card><Bar data={accuracyByRoundData} options={chartOptions('라운드별 정확도', '정확도 (%)')} /></Card>
          <Card><Bar data={responseTimeByRoundData} options={chartOptions('라운드별 평균 반응 시간', '시간 (초)')} /></Card>
        </div>

        {round2Stats && round2Stats.conditionStats && round2Stats.conditionStats.length > 0 && (
          <Card title="2라운드 - 조건별 통계">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="chart-container">
                <Bar
                  data={{
                    labels: round2Stats.conditionStats.map(cs => cs.conditionType),
                    datasets: [{
                      label: '정확도 (%)',
                      data: round2Stats.conditionStats.map(cs => cs.accuracy),
                      backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    }],
                  }}
                  options={chartOptions('2라운드 - 조건별 정확도', '정확도 (%)')}
                />
              </div>
              <div className="chart-container">
                <Bar
                  data={{
                    labels: round2Stats.conditionStats.map(cs => cs.conditionType),
                    datasets: [{
                      label: '평균 반응 시간 (초)',
                      data: round2Stats.conditionStats.map(cs => cs.averageTimeTakenSec),
                      backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    }],
                  }}
                  options={chartOptions('2라운드 - 조건별 평균 반응 시간', '시간 (초)')}
                />
              </div>
            </div>
          </Card>
        )}
        
        {resultsR1.length > 0 && (
          <Card title="1라운드 상세 기록">
            <ResultsTable columns={columnsR1} data={resultsR1} />
          </Card>
        )}

        {resultsR2.length > 0 && (
          <Card title="2라운드 상세 기록">
            <ResultsTable columns={columnsR2} data={resultsR2} />
          </Card>
        )}
      </div>
    </RecordPageLayout>
  );
}
