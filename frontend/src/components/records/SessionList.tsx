import { types } from '@wails/go/models';
import { formatSettings as formatNbackSettings, parseSettings as parseNbackSettings } from '@utils/nbackHelpers';
import { formatSettings as formatNumberPressingSettings, parseSettings as parseNumberPressingSettings } from '@utils/numberPressingHelpers';
import { formatSettings as formatRpsSettings, parseSettings as parseRpsSettings } from '@utils/rpsHelpers';

interface SessionListProps {
  sessions: types.GameSession[];
  loading: boolean;
  error: string | null;
  onSessionClick: (id: number) => void;
  activeSessionId?: number | null;
}

export function SessionList({ sessions, loading, error, onSessionClick, activeSessionId }: SessionListProps) {

  const renderSettings = (session: types.GameSession, isExpanded: boolean) => {
    try {
      let settingsArray: string[] = [];
      switch (session.gameCode) {
        case 'NBACK':
          const nbackSettings = parseNbackSettings(session.settings);
          if (nbackSettings) settingsArray = formatNbackSettings(nbackSettings);
          break;
        case 'NUMBER_PRESSING':
          const numPressSettings = parseNumberPressingSettings(session.settings);
          if (numPressSettings) settingsArray = formatNumberPressingSettings(numPressSettings);
          break;
        case 'RPS':
           const rpsSettings = parseRpsSettings(session.settings);
           if (rpsSettings) settingsArray = formatRpsSettings(rpsSettings);
           break;
        default:
          return <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{session.settings}</p>;
      }

      if (isExpanded) {
        return (
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {settingsArray.map((line, index) => <p key={index}>{line}</p>)}
          </div>
        );
      } else {
        return (
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            설정: {settingsArray.join(' | ')}
          </p>
        );
      }

    } catch (e) {
      console.error('Error rendering settings for session:', session, e);
      return <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{session.settings}</p>;
    }
  };

  if (loading) return <p>세션 목록을 불러오는 중...</p>;
  if (error) return <p className="text-red-500">세션 목록을 불러오지 못했습니다.</p>;
  if (sessions.length === 0) return <p>기록된 세션이 없습니다.</p>;

  return (
    <ul className="space-y-2">
      {sessions.map(session => {
        const isActive = session.id === activeSessionId;
        return (
          <li
            key={session.id}
            className={`p-4 mb-2 border rounded-lg shadow-sm cursor-pointer transition-all duration-300 ${isActive ? 'bg-primary-light/10 dark:bg-primary-dark/20 border-primary-light dark:border-primary-dark' : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-600'}`}
            onClick={() => onSessionClick(session.id)}>
            <p className="font-semibold">세션 ID: {session.id}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">{new Date(session.playDatetime).toLocaleString()}</p>
            {renderSettings(session, isActive)}
          </li>
        )
      })}
    </ul>
  );
}
