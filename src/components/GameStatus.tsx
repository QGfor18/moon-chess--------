import { Player } from '../types/game';

interface GameStatusProps {
  currentPlayer: Player;
  winner: Player | null;
  isThinking: boolean;
}

const playerNames: Record<Player, string> = {
  red: '红方',
  blue: '蓝方',
};

export default function GameStatus({
  currentPlayer,
  winner,
  isThinking,
}: GameStatusProps) {
  if (winner) {
    return (
      <div className="game-status">
        <span className={`status-badge ${winner}-win`}>
          {playerNames[winner]}胜利！
        </span>
      </div>
    );
  }

  if (isThinking) {
    return (
      <div className="game-status">
        <span className="status-thinking">AI 思考中...</span>
      </div>
    );
  }

  return (
    <div className="game-status">
      <span className={`status-turn turn-${currentPlayer}`}>
        {playerNames[currentPlayer]}回合
      </span>
    </div>
  );
}
