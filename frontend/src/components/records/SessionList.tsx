import { GameRecord } from '@records/recordStore';

interface SessionListProps {
  sessions: GameRecord[];
  formatSettings: (settings: any) => string[];
  onSessionClick: (id: number) => void;
  activeSessionId?: number | null;
}

export function SessionList({ sessions, formatSettings, onSessionClick, activeSessionId }: SessionListProps) {
  if (sessions.length === 0) return <p>기록된 세션이 없습니다.</p>;

  return (
    <ul className="space-y-2">
      {sessions.map(session => {
        const isActive = session.id === activeSessionId;
        const lines = formatSettings(session.settings);
        return (
          <li
            key={session.id}
            className={`p-4 mb-2 border rounded-lg shadow-sm cursor-pointer transition-all duration-300 ${isActive ? 'bg-primary-light/10 dark:bg-primary-dark/20 border-primary-light dark:border-primary-dark' : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-600'}`}
            onClick={() => onSessionClick(session.id)}>
            <p className="font-semibold">{new Date(session.playedAt).toLocaleString()}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">{session.results.length}문제</p>
            {isActive ? (
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {lines.map((line, index) => <p key={index}>{line}</p>)}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">설정: {lines.join(' | ')}</p>
            )}
          </li>
        )
      })}
    </ul>
  );
}
