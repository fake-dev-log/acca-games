import { FC } from 'react';
import { GameCodeSlugs, GameCodeNames } from '@constants/gameCodes';
import { GameRecordsDashboard } from '@components/records/GameRecordsDashboard';
import { useCatChaserStore } from '../stores/useCatChaserStore';
import { CatChaserSessionWithResults } from '@features/cat-chaser/logic/types';

export const CatChaserRecords: FC = () => {
    const calculateSessionMetrics = (session: CatChaserSessionWithResults) => {
        const totalAnswers = session.results.length;
        const correctAnswers = session.results.filter(r => r.isCorrect).length;
        const accuracy = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;

        return {
            'Accuracy': accuracy,
        };
    };

    const metricOptions = [
        { value: 'Accuracy', label: '정확도' },
    ];

    // Adapter for store hook to match GameRecordsDashboard expectation
    const useStoreAdapter = () => {
        const { paginatedSessions, loading, error, fetchPaginatedSessions } = useCatChaserStore();
        return { paginatedSessions, loading, error, fetchPaginatedSessions };
    };

    return (
        <GameRecordsDashboard
            gameCodeSlug={GameCodeSlugs.CAT_CHASER}
            gameTitle={GameCodeNames.CAT_CHASER}
            useStoreHook={useStoreAdapter}
            calculateSessionMetrics={calculateSessionMetrics}
            metricOptions={metricOptions}
        />
    );
};
