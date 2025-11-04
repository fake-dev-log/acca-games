import { GridSelectionLayout } from '@components/layout/GridSelectionLayout';
import { GridItemButton } from '@components/common/GridItemButton';

export function RecordsIndex() {
  return (
    <GridSelectionLayout backPath="/" title="기록 보기" gridCols="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <GridItemButton to="/records/n-back" title="도형 순서 기억하기" description="N-Back" />
            <GridItemButton to="/records/rps" title="가위바위보" description="Rock-Paper-Scissors" />
            <GridItemButton to="/records/number-pressing" title="숫자 누르기" description="Number Pressing" />
            {/* New records will be added here */}
    </GridSelectionLayout>
  );
}
