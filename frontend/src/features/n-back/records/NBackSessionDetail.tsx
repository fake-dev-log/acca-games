import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { types } from '@wails/go/models';
import { useNBackStore } from '@features/n-back/stores/nbackStore';
import { RecordPageLayout } from '@layout/RecordPageLayout';
import { SessionList } from '@components/records/SessionList';
import { ResultsTable, Column } from '@components/records/ResultsTable';
import { Card } from '@components/common/Card';
import { GameCodeSlugs } from '@constants/gameCodes';
import { fetchNBackSessionStats, NBackSessionStats } from '@api/stats'; // Import new API and interface

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function NBackSessionDetail() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const {
    paginatedSessions,
    loading,
    error,
    fetchPaginatedSessions,
  } = useNBackStore();

  const sessionsWithResults = paginatedSessions.sessions;

  const [sessionStats, setSessionStats] = useState<NBackSessionStats | null>(null);
  const [statsLoading, setStatsLoading] = useState<boolean>(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // If the store is empty, fetch the first page. The desired session might be there.
  useEffect(() => {
    if (sessionsWithResults.length === 0) {
      fetchPaginatedSessions(1, 10);
    }
  }, [sessionsWithResults.length, fetchPaginatedSessions]);

  useEffect(() => {
    if (sessionId) {
      setStatsLoading(true);
      setStatsError(null);
      fetchNBackSessionStats(parseInt(sessionId))
        .then(stats => {
          setSessionStats(stats);
        })
        .catch(err => {
          console.error("Failed to fetch N-Back session stats:", err);
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
    navigate(`/records/${GameCodeSlugs.N_BACK}/${id}`);
  };

  const sidebar = <SessionList sessions={sessionsForList} loading={loading} error={error} onSessionClick={handleSessionClick} activeSessionId={parseInt(sessionId!)} />;

  if (loading && !currentSession || statsLoading && !sessionStats) {
    return <RecordPageLayout backPath={`/records/${GameCodeSlugs.N_BACK}`} title="세션 상세 기록" sidebarContent={sidebar}><p>세션 상세 정보를 불러오는 중...</p></RecordPageLayout>;
  }

  if (error || statsError) {
    return <RecordPageLayout backPath={`/records/${GameCodeSlugs.N_BACK}`} title="세션 상세 기록" sidebarContent={sidebar}><p className="text-red-500">{error || statsError}</p></RecordPageLayout>;
  }

  if (!currentSession || !sessionStats) {
    return <RecordPageLayout backPath={`/records/${GameCodeSlugs.N_BACK}`} title="세션 상세 기록" sidebarContent={sidebar}><p>세션을 찾을 수 없습니다. 목록에서 다른 세션을 선택해주세요.</p></RecordPageLayout>;
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
    datasets: [
      {
        label: '정확도 (%)',
        data: sessionStats.roundStats.map(rs => rs.accuracy),
        backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)'],
        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const responseTimeByRoundData = {
    labels: sessionStats.roundStats.map(rs => `라운드 ${rs.round}`),
    datasets: [
      {
        label: '평균 반응 시간 (ms)',
        data: sessionStats.roundStats.map(rs => rs.averageResponseTimeMs),
        backgroundColor: ['rgba(255, 159, 64, 0.6)', 'rgba(54, 162, 235, 0.6)'],
        borderColor: ['rgba(255, 159, 64, 1)', 'rgba(54, 162, 235, 1)'],
        borderWidth: 1,
      },
    ],
  };

  const round2Stats = sessionStats.roundStats.find(rs => rs.round === 2);

  const columns: Column<types.NBackResult>[] = [
    { header: '문제 번호', accessor: (row) => row.questionNum },
    { header: '라운드', accessor: (row) => row.round },
    { header: '플레이어 선택', accessor: (row) => row.playerChoice },
    { header: '정답', accessor: (row) => row.correctChoice },
    { header: '정답 여부', accessor: (row) => row.isCorrect ? 'O' : 'X' },
    { header: '반응 시간 (ms)', accessor: (row) => row.responseTimeMs },
  ];

  return (
    <RecordPageLayout backPath={`/records/${GameCodeSlugs.N_BACK}`} title={`세션 상세 기록 (ID: ${sessionId})`} sidebarContent={sidebar}>
      <div className="space-y-6">
        <Card title="요약 정보">
          <p>총 문제 수: {sessionStats.totalQuestions}</p>
          <p>정답 수: {sessionStats.totalCorrect}</p>
          <p>전체 정확도: {sessionStats.overallAccuracy.toFixed(2)}%</p>
          <p>평균 반응 시간: {sessionStats.averageResponseTimeMs.toFixed(2)} ms</p>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <Bar data={accuracyByRoundData} options={chartOptions('라운드별 정확도', '정확도 (%)')} />
          </Card>
          <Card>
            <Bar data={responseTimeByRoundData} options={chartOptions('라운드별 평균 반응 시간', '시간 (ms)')} />
          </Card>
        </div>

        {round2Stats && round2Stats.nBackLevelStats && round2Stats.nBackLevelStats.length > 0 && (
          <Card title="라운드 2 - N-Back 레벨별 통계">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="chart-container">
                <Bar
                  data={{
                    labels: round2Stats.nBackLevelStats.map(nls => `${nls.nBackLevel}-Back`),
                    datasets: [{
                      label: '정확도 (%)',
                      data: round2Stats.nBackLevelStats.map(nls => nls.accuracy),
                      backgroundColor: ['rgba(54, 162, 235, 0.6)', 'rgba(255, 99, 132, 0.6)'],
                    }],
                  }}
                  options={chartOptions('라운드 2 - N-Back 레벨별 정확도', '정확도 (%)')}
                />
              </div>
              <div className="chart-container">
                <Bar
                  data={{
                    labels: round2Stats.nBackLevelStats.map(nls => `${nls.nBackLevel}-Back`),
                    datasets: [{
                      label: '평균 반응 시간 (ms)',
                      data: round2Stats.nBackLevelStats.map(nls => nls.averageResponseTimeMs),
                      backgroundColor: ['rgba(153, 102, 255, 0.6)', 'rgba(255, 206, 86, 0.6)'],
                    }],
                  }}
                  options={chartOptions('라운드 2 - N-Back 레벨별 평균 반응 시간', '시간 (ms)')}
                />
              </div>
            </div>
          </Card>
        )}

        <Card title="라운드별 상세 기록">
          <ResultsTable columns={columns} data={sessionResults} />
        </Card>
      </div>
    </RecordPageLayout>
  );
}
