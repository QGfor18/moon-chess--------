import { Player, Position } from '../types/game';

interface CellProps {
  row: number;
  col: number;
  value: Player | null;
  isOldest: boolean;
  queueIndex: number; // 0-based position in queue: 0=oldest, 1, 2=newest
  isWinCell: boolean;
  disabled: boolean;
  onClick: (pos: Position) => void;
}

export default function Cell({
  row,
  col,
  value,
  isOldest,
  queueIndex,
  isWinCell,
  disabled,
  onClick,
}: CellProps) {
  const handleClick = () => {
    if (!disabled && !value) {
      onClick({ row, col });
    }
  };

  let cellClass = 'cell';
  if (value === 'red') cellClass += ' cell-red';
  else if (value === 'blue') cellClass += ' cell-blue';
  if (isOldest) cellClass += ' cell-oldest';
  if (isWinCell) cellClass += ' cell-win';
  if (!value && !disabled) cellClass += ' cell-empty';
  if (disabled && !value) cellClass += ' cell-disabled';

  return (
    <button className={cellClass} onClick={handleClick} disabled={disabled}>
      {value && (
        <>
          <span className="piece" />
          <span className="queue-badge">{queueIndex + 1}</span>
        </>
      )}
    </button>
  );
}
