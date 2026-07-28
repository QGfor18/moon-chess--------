import {
  Board,
  CellState,
  GameState,
  Player,
  Position,
  WIN_LINES,
} from '../types/game';
import { getAvailableMoves, getCellAt, placePiece } from './gameEngine';

// Evaluate the board from the perspective of the given player
function evaluate(state: GameState, aiPlayer: Player): number {
  const opponent: Player = aiPlayer === 'red' ? 'blue' : 'red';
  const board = state.board;

  // Check immediate win/loss
  if (state.winner === aiPlayer) return 1000;
  if (state.winner === opponent) return -1000;

  let score = 0;
  const oppQueue = aiPlayer === 'red' ? state.blueQueue : state.redQueue;
  const myQueue = aiPlayer === 'red' ? state.redQueue : state.blueQueue;

  for (const line of WIN_LINES) {
    const cells: CellState[] = line.cells.map((pos) => getCellAt(board, pos));

    const myCount = cells.filter((c) => c === aiPlayer).length;
    const oppCount = cells.filter((c) => c === opponent).length;

    // Weight each piece by its position in the queue (newer = more weight)
    let myWeighted = 0;
    let oppWeighted = 0;

    for (let i = 0; i < line.cells.length; i++) {
      const pos = line.cells[i];
      if (getCellAt(board, pos) === aiPlayer) {
        const idx = myQueue.findIndex(
          (q) => q.row === pos.row && q.col === pos.col
        );
        // Newer pieces (index 1-2) have more weight than oldest (index 0)
        myWeighted += idx >= 0 ? (idx + 1) / 3 : 0.33;
      } else if (getCellAt(board, pos) === opponent) {
        const idx = oppQueue.findIndex(
          (q) => q.row === pos.row && q.col === pos.col
        );
        oppWeighted += idx >= 0 ? (idx + 1) / 3 : 0.33;
      }
    }

    // If line has both players' pieces, it's blocked
    if (myCount > 0 && oppCount > 0) continue;

    // Potential winning lines
    if (oppCount === 0) {
      if (myCount === 2) score += 50 + myWeighted * 20;
      else if (myCount === 1) score += 5 + myWeighted * 3;
    }

    // Defense: opponent threats
    if (myCount === 0) {
      if (oppCount === 2) score -= 40 + oppWeighted * 15;
      else if (oppCount === 1) score -= 3 + oppWeighted * 2;
    }
  }

  // Center control
  if (board[1][1] === aiPlayer) score += 8;
  else if (board[1][1] === opponent) score -= 6;

  // Corner control
  const corners: Position[] = [
    { row: 0, col: 0 },
    { row: 0, col: 2 },
    { row: 2, col: 0 },
    { row: 2, col: 2 },
  ];
  for (const corner of corners) {
    if (getCellAt(board, corner) === aiPlayer) score += 3;
    else if (getCellAt(board, corner) === opponent) score -= 2;
  }

  return score;
}

function minimax(
  state: GameState,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  aiPlayer: Player
): number {
  if (depth === 0 || state.winner) {
    return evaluate(state, aiPlayer);
  }

  const moves = getAvailableMoves(state.board);

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const nextState = placePiece(state, move);
      if (!nextState) continue;
      const evalScore = minimax(
        nextState,
        depth - 1,
        alpha,
        beta,
        false,
        aiPlayer
      );
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return moves.length === 0 ? evaluate(state, aiPlayer) : maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const nextState = placePiece(state, move);
      if (!nextState) continue;
      const evalScore = minimax(
        nextState,
        depth - 1,
        alpha,
        beta,
        true,
        aiPlayer
      );
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return moves.length === 0 ? evaluate(state, aiPlayer) : minEval;
  }
}

export function findBestMove(state: GameState, depth: number = 7): Position | null {
  const aiPlayer = state.currentPlayer;
  const moves = getAvailableMoves(state.board);

  if (moves.length === 0) return null;

  let bestScore = -Infinity;
  let bestMove = moves[0];

  for (const move of moves) {
    const nextState = placePiece(state, move);
    if (!nextState) continue;

    const score = minimax(
      nextState,
      depth - 1,
      -Infinity,
      Infinity,
      false,
      aiPlayer
    );

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

// Easy mode: random valid move
export function findRandomMove(board: Board): Position | null {
  const moves = getAvailableMoves(board);
  if (moves.length === 0) return null;
  return moves[Math.floor(Math.random() * moves.length)];
}

// Medium: depth 4
export function findMediumMove(state: GameState): Position | null {
  return findBestMove(state, 4);
}

// Hard: depth 8
export function findHardMove(state: GameState): Position | null {
  return findBestMove(state, 8);
}

// Dispatch by difficulty
export function findMoveByDifficulty(
  state: GameState
): Position | null {
  switch (state.aiDifficulty) {
    case 'easy':
      return findRandomMove(state.board);
    case 'medium':
      return findMediumMove(state);
    case 'hard':
      return findHardMove(state);
    default:
      return findBestMove(state, 6);
  }
}
