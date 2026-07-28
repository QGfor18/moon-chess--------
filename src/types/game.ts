export type Player = 'red' | 'blue';
export type CellState = Player | null;
export type Board = CellState[][];
export type AIDifficulty = 'easy' | 'medium' | 'hard';

export interface Position {
  row: number;
  col: number;
}

export interface GameState {
  board: Board;
  currentPlayer: Player;
  redQueue: Position[];
  blueQueue: Position[];
  winner: Player | null;
  gameMode: 'pvp' | 'ai';
  aiDifficulty: AIDifficulty;
  isThinking: boolean;
  /** 人机对战时玩家选择的阵营 */
  playerSide: Player;
}

export interface WinLine {
  cells: Position[];
}

export const WIN_LINES: WinLine[] = [
  { cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }] },
  { cells: [{ row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 }] },
  { cells: [{ row: 2, col: 0 }, { row: 2, col: 1 }, { row: 2, col: 2 }] },
  { cells: [{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 2, col: 0 }] },
  { cells: [{ row: 0, col: 1 }, { row: 1, col: 1 }, { row: 2, col: 1 }] },
  { cells: [{ row: 0, col: 2 }, { row: 1, col: 2 }, { row: 2, col: 2 }] },
  { cells: [{ row: 0, col: 0 }, { row: 1, col: 1 }, { row: 2, col: 2 }] },
  { cells: [{ row: 0, col: 2 }, { row: 1, col: 1 }, { row: 2, col: 0 }] },
];

export function posEqual(a: Position, b: Position): boolean {
  return a.row === b.row && a.col === b.col;
}

export function createEmptyBoard(): Board {
  return [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ];
}
