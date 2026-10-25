import { useNavigate, useParams } from 'react-router-dom';
import { RecordPageLayout } from '@layout/RecordPageLayout';
import { PageLayout } from '@components/layout/PageLayout';
import { SessionList } from '@components/records/SessionList';
import { BreakdownTable } from '@components/records/BreakdownTable';
import { Card } from '@components/common/Card';
import { findGameBySlug } from '@games/registry';
import { useRecord, useRecordPage } from '@records/useRecords';

export function SessionDetailPage() {
  const { slug, sessionId } = useParams<{ slug: string; sessionId: string }>();
  const navigate = useNavigate();
  const game = findGameBySlug(slug);
  const id = Number(sessionId);
  const recent = useRecordPage(game?.code ?? '', 1, 10);
  const { data: record, loading, error } = useRecord(id);

  if (!game) {
    return <PageLayout title="기록" backPath="/records"><p>알 수 없는 게임입니다.</p></PageLayout>;
  }

  const backPath = `/records/${game.slug}`;
  const sidebar = recent.data
    ? <SessionList sessions={recent.data.records} formatSettings={game.formatSettings} activeSessionId={id}
        onSessionClick={(sid) => navigate(`/records/${game.slug}/${sid}`)} />
    : <p>세션 목록을 불러오는 중...</p>;

  const body = () => {
    if (loading) return <p>세션 상세 정보를 불러오는 중...</p>;
    if (error) return <p className="text-red-500">{error}</p>;
    if (!record || record.gameCode !== game.code) return <p>세션을 찾을 수 없습니다.</p>;
    const { ResultDetail } = game;
    return (
      <div className="space-y-6">
        <Card title="설정">
          {game.formatSettings(record.settings).map((line, i) => <p key={i}>{line}</p>)}
        </Card>
        {game.breakdowns && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {game.breakdowns(record.results).map((b) => <BreakdownTable key={b.title} breakdown={b} />)}
          </div>
        )}
        <ResultDetail results={record.results} />
      </div>
    );
  };

  const title = record ? `세션 상세 · ${new Date(record.playedAt).toLocaleString()}` : '세션 상세';
  return (
    <RecordPageLayout backPath={backPath} title={title} sidebarContent={sidebar}>
      {body()}
    </RecordPageLayout>
  );
}
