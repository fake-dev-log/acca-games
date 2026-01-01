import { formatSettings as formatNbackSettings, parseSettings as parseNbackSettings } from '@utils/nbackHelpers';
import { formatSettings as formatNumberPressingSettings, parseSettings as parseNumberPressingSettings } from '@utils/numberPressingHelpers';
import { formatSettings as formatRpsSettings, parseSettings as parseRpsSettings } from '@utils/rpsHelpers';
import { formatSettings as formatShapeRotationSettings, parseSettings as parseShapeRotationSettings } from '@utils/shapeRotationHelpers';
import { formatSettings as formatCountComparisonSettings, parseSettings as parseCountComparisonSettings } from '@utils/countComparisonHelpers'; // Import CountComparisonSettings formatter
import { formatSettings as formatCatChaserSettings, parseSettings as parseCatChaserSettings } from '@utils/catChaserHelpers';
import { GameCodes } from "@constants/gameCodes";
import { BaseGameSessionInfo } from '@type/common'; // Import the new base interface


interface SessionListProps {
  sessions: BaseGameSessionInfo[];
  loading: boolean;
  error: string | null;
  onSessionClick: (id: number) => void;
  activeSessionId?: number | null;
}

export function SessionList({ sessions, loading, error, onSessionClick, activeSessionId }: SessionListProps) {

  const renderSettings = (session: BaseGameSessionInfo, isExpanded: boolean) => {
    try {
      let settingsArray: string[] = [];
      let parsedSettings: any = null; // Use 'any' for now, as it could be different types

      switch (session.gameCode) {
        case GameCodes.N_BACK:
          parsedSettings = parseNbackSettings(session.settings);
          if (parsedSettings) settingsArray = formatNbackSettings(parsedSettings);
          break;
        case GameCodes.NUMBER_PRESSING:
          parsedSettings = parseNumberPressingSettings(session.settings);
          if (parsedSettings) settingsArray = formatNumberPressingSettings(parsedSettings);
          break;
        case GameCodes.RPS:
          parsedSettings = parseRpsSettings(session.settings);
          if (parsedSettings) settingsArray = formatRpsSettings(parsedSettings);
          break;
        case GameCodes.SHAPE_ROTATION:
          parsedSettings = parseShapeRotationSettings(session.settings);
          if (parsedSettings) settingsArray = formatShapeRotationSettings(parsedSettings);
          break;
        case GameCodes.COUNT_COMPARISON: // Handle CountComparison explicitly
          parsedSettings = parseCountComparisonSettings(session.settings);
          if (parsedSettings) settingsArray = formatCountComparisonSettings(parsedSettings);
          break;
        case GameCodes.CAT_CHASER:
          parsedSettings = parseCatChaserSettings(session.settings);
          if (parsedSettings) settingsArray = formatCatChaserSettings(parsedSettings);
          break;
        default:
          // If gameCode is unknown or settings couldn't be formatted, display raw JSON
          return <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{session.settings}</p>;
      }

      if (!parsedSettings) {
        return <p className="text-sm text-red-500 dark:text-red-400 truncate">설정 파싱 오류</p>;
      }

      if (isExpanded) {
        return (
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {settingsArray.map((line, index) => <p key={`${session.id}-${index}`}>{line}</p>)}
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
      // If error occurs, try to stringify the settings to display something
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
            <p className="text-sm text-gray-600 dark:text-gray-300">{new Date(String(session.playDatetime)).toLocaleString()}</p>
            {renderSettings(session, isActive)}
          </li>
        )
      })}
    </ul>
  );
}
