import {
  Board,
  CellState,
  GameState,
  Player,
  Position,
  posEqual,
  WIN_LINES,
} from '../types/game';
import { getAvailableMoves, getCellAt, placePiece } from './gameEngine';

/**
 * 模拟指定玩家在某个位置落子后是否能立即获胜（考虑 FIFO 队列）
 */
function canWinAt(state: GameState, pos: Position, player: Player): boolean {
  const testState = { ...state, currentPlayer: player };
  const next = placePiece(testState, pos);
  return next?.winner === player;
}

/**
 * 检测对手在当前棋盘上有哪些"两子连线+一空位"的威胁位置
 * 返回对手下在此处就能获胜的位置列表
 */
function findOpponentWinThreats(
  state: GameState,
  aiPlayer: Player
): Position[] {
  const opponent: Player = aiPlayer === 'red' ? 'blue' : 'red';
  const moves = getAvailableMoves(state.board);
  return moves.filter((move) => canWinAt(state, move, opponent));
}

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

  WIN_LINES.forEach((line, lineIndex) => {
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
    if (myCount > 0 && oppCount > 0) return;

    // 横竖线（索引 0-5）比对角线（索引 6-7）权重更高
    // 横竖线是更常见、更危险的威胁方向
    const isStraightLine = lineIndex < 6;
    const lineMultiplier = isStraightLine ? 1.5 : 1.0;

    // Potential winning lines
    if (oppCount === 0) {
      if (myCount === 2) score += (50 + myWeighted * 20) * lineMultiplier;
      else if (myCount === 1) score += (5 + myWeighted * 3) * lineMultiplier;
    }

    // Defense: opponent threats（防守权重已加强，横竖线再加 1.5×）
    if (myCount === 0) {
      if (oppCount === 2) score -= (80 + oppWeighted * 25) * lineMultiplier;
      else if (oppCount === 1) score -= (5 + oppWeighted * 3) * lineMultiplier;
    }
  });

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
  const opponent: Player = aiPlayer === 'red' ? 'blue' : 'red';
  const moves = getAvailableMoves(state.board);

  if (moves.length === 0) return null;

  // ── 优先级 1：AI 能立即获胜 → 直接落子 ──
  for (const move of moves) {
    if (canWinAt(state, move, aiPlayer)) {
      return move;
    }
  }

  // ── 优先级 2：检测对手的即时获胜威胁（考虑 FIFO 队列）──
  const opponentWinThreats = findOpponentWinThreats(state, aiPlayer);

  if (opponentWinThreats.length === 1) {
    // 单一威胁 → 必须堵
    return opponentWinThreats[0];
  }

  // ── 优先级 3：多威胁 / 无立即威胁 → minimax 搜索 ──
  let bestScore = -Infinity;
  let bestMove = moves[0];

  // 构建威胁位置集合，用于给堵棋加分
  const threatKeySet = new Set(
    opponentWinThreats.map((p) => `${p.row},${p.col}`)
  );

  for (const move of moves) {
    const nextState = placePiece(state, move);
    if (!nextState) continue;

    let score = minimax(
      nextState,
      depth - 1,
      -Infinity,
      Infinity,
      false,
      aiPlayer
    );

    // 堵住对手威胁位置给额外加分，确保在分数接近时优先堵棋
    if (threatKeySet.has(`${move.row},${move.col}`)) {
      score += 300;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  // 兜底：如果所有走法都导致失败且存在威胁位置，至少选一个威胁位置堵
  if (bestScore <= -900 && opponentWinThreats.length > 0) {
    bestMove = opponentWinThreats[0];
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
