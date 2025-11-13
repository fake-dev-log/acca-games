import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { types } from '@wails/go/models';
import useShapeRotationStore from '../stores/shapeRotationStore';
import { RecordPageLayout } from '@components/layout/RecordPageLayout';
import { GameCodeSlugs } from '@constants/gameCodes';
import { SessionList } from '@components/records/SessionList';
import { ResultsTable, Column } from '@components/records/ResultsTable';
import { Card } from '@components/common/Card';

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

  useEffect(() => {
    if (sessionsWithResults.length === 0) {
      fetchPaginatedSessions(1, 10);
    }
  }, [sessionsWithResults.length, fetchPaginatedSessions]);

  const currentSession = sessionsWithResults.find(s => s.id === Number(sessionId));
  const sessionResults = currentSession?.results || [];
  const sessionsForList = sessionsWithResults.map(({ results, ...sessionInfo }) => sessionInfo);

  const handleSessionClick = (id: number) => {
    navigate(`/records/${GameCodeSlugs.SHAPE_ROTATION}/${id}`);
  };

  const sidebar = <SessionList sessions={sessionsForList} loading={loading} error={error} onSessionClick={handleSessionClick} activeSessionId={parseInt(sessionId!)} />;

  if (loading && !currentSession) {
    return <RecordPageLayout backPath={`/records/${GameCodeSlugs.SHAPE_ROTATION}`} title="세션 상세 기록" sidebarContent={sidebar}><p>세션 상세 정보를 불러오는 중...</p></RecordPageLayout>;
  }

  if (error) {
    return <RecordPageLayout backPath={`/records/${GameCodeSlugs.SHAPE_ROTATION}`} title="세션 상세 기록" sidebarContent={sidebar}><p className="text-red-500">{error}</p></RecordPageLayout>;
  }

  if (!currentSession) {
    return <RecordPageLayout backPath={`/records/${GameCodeSlugs.SHAPE_ROTATION}`} title="세션 상세 기록" sidebarContent={sidebar}><p>세션을 찾을 수 없습니다.</p></RecordPageLayout>;
  }

  const totalProblems = sessionResults.length;
  const correctProblems = sessionResults.filter(r => r.isCorrect).length;
  const overallAccuracy = totalProblems > 0 ? (correctProblems / totalProblems) * 100 : 0;
  const avgSolveTime = totalProblems > 0 ? (sessionResults.reduce((sum, r) => sum + r.solveTime, 0) / totalProblems) / 1000 : 0;
  const avgClickCount = totalProblems > 0 ? (sessionResults.reduce((sum, r) => sum + r.clickCount, 0) / totalProblems) : 0;

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
          <p>총 문제 수: {totalProblems}</p>
          <p>정답 수: {correctProblems}</p>
          <p>전체 정확도: {overallAccuracy.toFixed(2)}%</p>
          <p>평균 풀이 시간: {avgSolveTime.toFixed(2)} 초</p>
		  <p>평균 클릭 수: {avgClickCount.toFixed(2)}</p>
        </Card>

        <Card title="상세 기록">
          <ResultsTable columns={columns} data={sessionResults} />
        </Card>
      </div>
    </RecordPageLayout>
  );
}
