import { useNavigate } from 'react-router-dom';
import { GridSelectionLayout } from '@components/layout/GridSelectionLayout';
import { GridItemButton } from '@components/common/GridItemButton';

export function RecordsIndex() {
  const navigate = useNavigate();

  return (
    <GridSelectionLayout backPath="/" title="기록 보기" gridCols="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <GridItemButton to="/records/n-back" title="도형 순서 기억하기" description="N-Back 게임 기록" />
      {/* Other game records will be added here */}
    </GridSelectionLayout>
  );
}
