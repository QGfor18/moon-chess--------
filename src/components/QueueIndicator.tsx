import { Player, Position } from '../types/game';

interface QueueIndicatorProps {
  player: Player;
  queue: Position[];
  label: string;
}

export default function QueueIndicator({
  player,
  queue,
  label,
}: QueueIndicatorProps) {
  const slots = [0, 1, 2];

  return (
    <div className={`queue-indicator queue-${player}`}>
      <span className="queue-label">{label}</span>
      <div className="queue-slots">
        {slots.map((i) => {
          const filled = i < queue.length;
          const isOldest = filled && i === 0 && queue.length >= 3;
          return (
            <div
              key={i}
              className={`queue-slot ${filled ? 'filled' : 'empty'} ${isOldest ? 'oldest' : ''}`}
              title={isOldest ? '下一个棋子放置后此棋子将消失' : filled ? `棋子 #${i + 1}` : ''}
            >
              {filled && <span className="queue-piece" />}
              <span className="queue-index">{i + 1}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
