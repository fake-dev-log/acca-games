import { formatSettings as formatNbackSettings } from '@utils/nbackHelpers';
import { formatSettings as formatNumberPressingSettings, parseSettings as parseNumberPressingSettings } from '@utils/numberPressingHelpers';
import { formatSettings as formatRpsSettings, parseSettings as parseRpsSettings } from '@utils/rpsHelpers';
import { formatSettings as formatShapeRotationSettings } from '@utils/shapeRotationHelpers';
import { GameCodes } from "@constants/gameCodes";

// Define a local interface for the session data since types.GameSession is not directly available.
interface SessionInfo {
  id: number;
  gameCode: string;
  playDatetime: any;
  settings: any;
}

interface SessionListProps {
  sessions: SessionInfo[];
  loading: boolean;
  error: string | null;
  onSessionClick: (id: number) => void;
  activeSessionId?: number | null;
}

export function SessionList({ sessions, loading, error, onSessionClick, activeSessionId }: SessionListProps) {

  const renderSettings = (session: SessionInfo, isExpanded: boolean) => {
    try {
      let settingsArray: string[] = [];
      switch (session.gameCode) {
        case GameCodes.N_BACK:
          // Settings are already parsed in the store
          if (session.settings) settingsArray = formatNbackSettings(session.settings);
          break;
        case GameCodes.NUMBER_PRESSING:
           // Settings are already parsed in the store
          if (session.settings) settingsArray = formatNumberPressingSettings(session.settings);
          break;
        case GameCodes.RPS:
           // Settings are already parsed in the store
           if (session.settings) settingsArray = formatRpsSettings(session.settings);
           break;
        case GameCodes.SHAPE_ROTATION:
          // Settings are already parsed in the store
          if (session.settings) settingsArray = formatShapeRotationSettings(session.settings);
          break;
        default:
          return <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{JSON.stringify(session.settings)}</p>;
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
      // In case settings are a string
      const settingsString = typeof session.settings === 'string' ? session.settings : JSON.stringify(session.settings);
      return <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{settingsString}</p>;
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
            <p className="text-sm text-gray-600 dark:text-gray-300">{new Date(String(session.playDatetime)).toLocaleString()}</p>
            {renderSettings(session, isActive)}
          </li>
        )
      })}
    </ul>
  );
}
