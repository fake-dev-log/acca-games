import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { RecordPageLayout } from '@layout/RecordPageLayout';
import { PageLayout } from '@components/layout/PageLayout';
import { SessionList } from '@components/records/SessionList';
import { GameRecordsDashboard } from '@components/records/GameRecordsDashboard';
import { Pagination } from '@components/common/Pagination';
import { findGameBySlug } from '@games/registry';
import { useRecordPage } from '@records/useRecords';

const SESSIONS_PER_PAGE = 10;
const CHART_SESSIONS = 30;

export function GameRecordsPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const game = findGameBySlug(slug);
  const [page, setPage] = useState(1);
  const list = useRecordPage(game?.code ?? '', page, SESSIONS_PER_PAGE);
  const chart = useRecordPage(game?.code ?? '', 1, CHART_SESSIONS);

  if (!game) {
    return <PageLayout title="기록" backPath="/records"><p>알 수 없는 게임입니다.</p></PageLayout>;
  }

  const sidebar = list.loading ? <p>세션 목록을 불러오는 중...</p>
    : list.error ? <p className="text-red-500">{list.error}</p>
    : (
      <>
        <SessionList sessions={list.data!.records} formatSettings={game.formatSettings}
          onSessionClick={(id) => navigate(`/records/${game.slug}/${id}`)} />
        <Pagination currentPage={page} totalPages={Math.ceil(list.data!.totalCount / SESSIONS_PER_PAGE)} onPageChange={setPage} />
      </>
    );

  return (
    <RecordPageLayout backPath="/records" title={`${game.title} 기록`} sidebarContent={sidebar}>
      {chart.loading && <p>데이터를 불러오는 중...</p>}
      {chart.error && <p className="text-red-500">{chart.error}</p>}
      {chart.data && <GameRecordsDashboard game={game} records={chart.data.records} />}
    </RecordPageLayout>
  );
}
