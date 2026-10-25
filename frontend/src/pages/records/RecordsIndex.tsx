import { PageLayout } from '@components/layout/PageLayout';
import { GridItemButton } from '@components/common/GridItemButton';
import { GAMES } from '@games/registry';

export function RecordsIndex() {
  return (
    <PageLayout title="기록" backPath={"/"}>
      <p className="mb-6 text-sm opacity-70 text-center">기록은 이 브라우저에만 저장됩니다. 브라우저 사이트 데이터를 지우면 함께 지워집니다.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {GAMES.map((game) => (
          <GridItemButton key={game.slug} to={`/records/${game.slug}`} title={game.title} description={game.description} />
        ))}
      </div>
    </PageLayout>
  );
}
