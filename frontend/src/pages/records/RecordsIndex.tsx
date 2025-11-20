import { PageLayout } from '@components/layout/PageLayout';
import { GridItemButton } from '@components/common/GridItemButton';
import { GameCodeSlugs, GameCodeNames } from '@constants/gameCodes';

export function RecordsIndex() {
  return (
    <PageLayout title="기록" backPath={"/"}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <GridItemButton to={`/records/${GameCodeSlugs.N_BACK}`} title="도형 순서 기억하기" description={GameCodeNames.N_BACK} />
        <GridItemButton to={`/records/${GameCodeSlugs.RPS}`} title="가위바위보" description={GameCodeNames.RPS} />
        <GridItemButton to={`/records/${GameCodeSlugs.NUMBER_PRESSING}`} title="숫자 누르기" description={GameCodeNames.NUMBER_PRESSING} />
        <GridItemButton to={`/records/${GameCodeSlugs.SHAPE_ROTATION}`} title="도형 회전하기" description={GameCodeNames.SHAPE_ROTATION} />
        <GridItemButton to={`/records/${GameCodeSlugs.COUNT_COMPARISON}`} title="개수 비교하기" description={GameCodeNames.COUNT_COMPARISON} />
      </div>
    </PageLayout>
  );
}
