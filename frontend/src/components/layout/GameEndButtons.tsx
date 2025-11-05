import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@components/common/Button';

interface GameEndButtonsProps {
  gameCode: 'n-back' | 'rps' | 'number-pressing';
}

export const GameEndButtons: FC<GameEndButtonsProps> = ({ gameCode }) => {
  const navigate = useNavigate();

  const handleViewRecords = () => {
    navigate(`/records/${gameCode}`);
  };

  const handleRetry = () => {
    navigate(`/games/${gameCode}/setup`);
  };

  return (
    <div className="mt-6 flex flex-col items-center space-y-2">
      <Button onClick={handleViewRecords} className="w-48">
        기록 보기
      </Button>
      <Button onClick={handleRetry} className="w-48">
        다시하기
      </Button>
    </div>
  );
};
