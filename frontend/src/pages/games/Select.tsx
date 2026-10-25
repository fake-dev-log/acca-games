import { PageLayout } from '@components/layout/PageLayout';
import { GridItemButton } from '@components/common/GridItemButton';
import { GAMES } from '@games/registry';

export function Select() {
  return (
    <PageLayout title="게임 선택" backPath={"/"}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {GAMES.map((game) => (
          <GridItemButton key={game.slug} to={`/games/${game.slug}`} title={game.title} description={game.description} />
        ))}
      </div>
    </PageLayout>
  );
}
