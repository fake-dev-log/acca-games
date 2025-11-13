import { PageLayout } from '@components/layout/PageLayout';
import { GridItemButton } from '@components/common/GridItemButton';
import { GameCodeSlugs, GameCodeNames } from '@constants/gameCodes';

export function Select() {
  return (
    <PageLayout title="게임 선택" backPath={"/"}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <GridItemButton to={`/games/${GameCodeSlugs.N_BACK}`} title="도형 순서 기억하기" description={GameCodeNames.N_BACK} />
        <GridItemButton to={`/games/${GameCodeSlugs.RPS}`} title="가위바위보" description={GameCodeNames.RPS} />
        <GridItemButton to={`/games/${GameCodeSlugs.NUMBER_PRESSING}`} title="숫자 누르기" description={GameCodeNames.NUMBER_PRESSING} />
        <GridItemButton to={`/games/${GameCodeSlugs.SHAPE_ROTATION}`} title="도형 회전하기" description={GameCodeNames.SHAPE_ROTATION} />
      </div>
    </PageLayout>
  );
}
