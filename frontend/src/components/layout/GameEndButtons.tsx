import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@components/common/Button';
import { GameCodeSlug } from "@constants/gameCodes";

interface GameEndButtonsProps {
  gameCode: GameCodeSlug;
  sessionId: number;
}

export const GameEndButtons: FC<GameEndButtonsProps> = ({ gameCode, sessionId }) => {
  const navigate = useNavigate();

  const handleRetry = () => {
    // Navigate back to the game select or setup
    navigate(`/games/${gameCode}`);
  };

  const handleGoMain = () => {
    navigate('/');
  };

  return (
    <div className="mt-6 flex flex-col items-center space-y-2">
      <Button onClick={handleRetry} className="w-48">
        다시하기
      </Button>
      <Button onClick={handleGoMain} variant="secondary" className="w-48">
        메인으로
      </Button>
    </div>
  );
};
