import {
  Board,
  CellState,
  createEmptyBoard,
  GameState,
  Player,
  Position,
  WIN_LINES,
} from '../types/game';

import { AIDifficulty } from '../types/game';

export function createInitialState(
  gameMode: 'pvp' | 'ai',
  aiDifficulty: AIDifficulty = 'medium',
  playerSide: Player = 'red'
): GameState {
  return {
    board: createEmptyBoard(),
    currentPlayer: 'red',
    redQueue: [],
    blueQueue: [],
    winner: null,
    gameMode,
    aiDifficulty,
    isThinking: false,
    playerSide,
  };
}

export function getCellAt(board: Board, pos: Position): CellState {
  return board[pos.row][pos.col];
}

export function getAvailableMoves(board: Board): Position[] {
  const moves: Position[] = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (board[r][c] === null) {
        moves.push({ row: r, col: c });
      }
    }
  }
  return moves;
}

function cloneBoard(board: Board): Board {
  return board.map((row) => [...row]);
}

export function placePiece(state: GameState, pos: Position): GameState | null {
  // Validate: game not over and cell is empty
  if (state.winner) return null;
  if (state.board[pos.row][pos.col] !== null) return null;

  const player = state.currentPlayer;
  const newBoard = cloneBoard(state.board);

  // 1. Place piece
  newBoard[pos.row][pos.col] = player;

  // 2. Enqueue position
  const oldQueue = player === 'red' ? state.redQueue : state.blueQueue;
  let newQueue = [...oldQueue, pos];

  // 3. FIFO removal: if queue > 3, remove oldest
  let removedPos: Position | null = null;
  if (newQueue.length > 3) {
    removedPos = newQueue.shift()!;
    newBoard[removedPos.row][removedPos.col] = null;
  }

  // 4. Check win AFTER removal
  const winLine = findWinLine(newBoard, player);
  const winner = winLine ? player : null;

  // 5. Build new state
  const otherPlayer: Player = player === 'red' ? 'blue' : 'red';

  return {
    board: newBoard,
    currentPlayer: winner ? player : otherPlayer,
    redQueue: player === 'red' ? newQueue : state.redQueue,
    blueQueue: player === 'blue' ? newQueue : state.blueQueue,
    winner,
    gameMode: state.gameMode,
    aiDifficulty: state.aiDifficulty,
    isThinking: false,
    playerSide: state.playerSide,
  };
}

function findWinLine(
  board: Board,
  player: Player
): { cells: Position[] } | null {
  for (const line of WIN_LINES) {
    if (
      line.cells.every((pos) => getCellAt(board, pos) === player)
    ) {
      return line;
    }
  }
  return null;
}

export function getWinningLine(
  board: Board,
  player: Player
): { cells: Position[] } | null {
  return findWinLine(board, player);
}

export function getOldestPosition(queue: Position[]): Position | null {
  return queue.length >= 3 ? queue[0] : null;
}
