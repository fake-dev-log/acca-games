import { FC } from 'react';
import { types } from '@wails/go/models';
import { formatSettings } from '@utils/nbackHelpers';

interface SessionListProps {
  sessions: types.GameSession[];
  loading: boolean;
  error: string | null;
  onSessionClick: (sessionId: number) => void;
}

export const SessionList: FC<SessionListProps> = ({ sessions, loading, error, onSessionClick }) => {

  if (loading) return <p>세션 목록을 불러오는 중...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if ((sessions || []).length === 0) return <p>세션 데이터가 없습니다.</p>;

  return (
    <div className="p-2">
      <ul className="space-y-3">
        {(sessions || []).map((session: types.GameSession) => (
          <li key={session.sessionId} 
              className="p-4 border rounded-lg shadow-sm bg-surface hover:bg-primary hover:text-on-primary cursor-pointer transition-colors duration-200 text-on-surface"
              onClick={() => onSessionClick(session.sessionId)}>
            <p className="font-semibold">세션 ID: {session.sessionId}</p>
            <p className="text-sm opacity-75">플레이 시간: {new Date(session.playDatetime).toLocaleString()}</p>
            {/* Note: formatSettings might need to be generalized if it's n-back specific */}
            <p className="text-sm opacity-75">설정: {formatSettings(session.settings)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};
