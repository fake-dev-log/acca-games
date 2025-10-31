import { FC, useState } from 'react';
import { parseSettings, formatSettings } from '@utils/nbackHelpers';
import { useNBackSessions } from '@hooks/useNBackSessions'; // Import the custom hook

interface SessionListProps {
  onSessionClick: (sessionId: number) => void;
}

export const SessionList: FC<SessionListProps> = ({ onSessionClick }) => {
  const { sessions, loading, error } = useNBackSessions(); // Use the custom hook
  const [filterLevel, setFilterLevel] = useState<number | 'all'>('all');
  const [filterShapeGroup, setFilterShapeGroup] = useState<string | 'all'>('all');

  const filteredSessions = sessions.filter(session => {
    const settings = parseSettings(session.settings);
    if (!settings) return false;

    const levelMatch = filterLevel === 'all' || settings.nBackLevel === filterLevel;
    const shapeGroupMatch = filterShapeGroup === 'all' || settings.shapeGroup === filterShapeGroup;
    return levelMatch && shapeGroupMatch;
  });

  const uniqueShapeGroups = Array.from(new Set(sessions.map(s => parseSettings(s.settings)?.shapeGroup))).filter(Boolean) as string[];

  return (
    <div className="p-2">
      <div className="mb-4 flex flex-col space-y-2">
        <div>
          <label htmlFor="filterLevel" className="block text-sm font-medium text-on-surface">라운드 필터:</label>
          <select id="filterLevel" value={filterLevel} onChange={e => setFilterLevel(Number(e.target.value) || 'all')} className="mt-1 block w-full p-2 border rounded-md bg-background text-foreground">
            <option value="all">모두</option>
            <option value={1}>1라운드 (2-back)</option>
            <option value={2}>2라운드 (2 & 3-back)</option>
          </select>
        </div>
        <div>
          <label htmlFor="filterShapeGroup" className="block text-sm font-medium text-on-surface">도형 그룹 필터:</label>
          <select id="filterShapeGroup" value={filterShapeGroup} onChange={e => setFilterShapeGroup(e.target.value)} className="mt-1 block w-full p-2 border rounded-md bg-background text-foreground">
            <option value="all">모두</option>
            {uniqueShapeGroups.map(group => (
              <option key={group} value={group}>{group === 'random' ? '랜덤' : `${group.replace('group', '')}번 세트`}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && <p>세션 목록을 불러오는 중...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && filteredSessions.length === 0 && <p>필터링된 세션 데이터가 없습니다.</p>}
      
      <ul className="space-y-3">
        {filteredSessions.map(session => (
          <li key={session.sessionId} 
              className="p-4 border rounded-lg shadow-sm bg-surface hover:bg-primary hover:text-on-primary cursor-pointer transition-colors duration-200 text-on-surface"
              onClick={() => onSessionClick(session.sessionId)}>
            <p className="font-semibold">세션 ID: {session.sessionId}</p>
            <p className="text-sm text-on-primary opacity-75">플레이 시간: {new Date(session.playDatetime).toLocaleString()}</p>
            <p className="text-sm text-on-primary opacity-75">설정: {formatSettings(session.settings)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};


