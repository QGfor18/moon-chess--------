import { Board as BoardType, Position } from '../types/game';
import Cell from './Cell';

interface BoardProps {
  board: BoardType;
  redQueue: Position[];
  blueQueue: Position[];
  winCells: Position[];
  disabled: boolean;
  onCellClick: (pos: Position) => void;
}

export default function Board({
  board,
  redQueue,
  blueQueue,
  winCells,
  disabled,
  onCellClick,
}: BoardProps) {
  return (
    <div className="board">
      {board.map((row, r) =>
        row.map((cell, c) => {
          const queue = cell === 'red' ? redQueue : cell === 'blue' ? blueQueue : null;
          const queueIndex = queue
            ? queue.findIndex((q) => q.row === r && q.col === c)
            : -1;
          const isOldest = queueIndex === 0 && (queue?.length ?? 0) >= 3;
          const isWin = winCells.some((wc) => wc.row === r && wc.col === c);

          return (
            <Cell
              key={`${r}-${c}`}
              row={r}
              col={c}
              value={cell}
              isOldest={isOldest}
              queueIndex={queueIndex}
              isWinCell={isWin}
              disabled={disabled}
              onClick={onCellClick}
            />
          );
        })
      )}
    </div>
  );
}
