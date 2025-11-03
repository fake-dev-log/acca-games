import { GridSelectionLayout } from '@components/layout/GridSelectionLayout';
import { GridItemButton } from '@components/common/GridItemButton';

export default function Select() {
    return (
        <GridSelectionLayout backPath="/" title="게임 선택" gridCols="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <GridItemButton to="/games/n-back/setup" title="도형 순서 기억하기" description="N-Back" />
            <GridItemButton to="/games/rps/setup" title="가위바위보" description="Rock-Paper-Scissors" />
            {/* New games will be added here */}
        </GridSelectionLayout>
    )
}
