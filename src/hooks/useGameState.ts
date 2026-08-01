import { useState, useCallback, useEffect, useRef } from 'react';
import { AIDifficulty, GameState, Player } from '../types/game';
import { createInitialState, placePiece } from '../logic/gameEngine';
import { findMoveByDifficulty } from '../logic/ai';
import { Position } from '../types/game';

export function useGameState(initialMode: 'pvp' | 'ai' = 'pvp') {
  const [state, setState] = useState<GameState>(() =>
    createInitialState(initialMode)
  );

  // 悔棋历史栈：存储每次玩家落子前的状态
  const historyRef = useRef<GameState[]>([]);
  // AI 的 setTimeout id，用于悔棋时取消 AI 的思考
  const aiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHistory = useCallback(() => {
    historyRef.current = [];
  }, []);

  const handlePlacePiece = useCallback(
    (pos: Position) => {
      setState((prev) => {
        // 人机模式下，AI 回合时不允许玩家替 AI 落子
        if (
          prev.gameMode === 'ai' &&
          prev.currentPlayer !== prev.playerSide
        ) {
          return prev;
        }

        const next = placePiece(prev, pos);
        if (!next) return prev;

        // 落子成功，将旧状态推入历史栈
        historyRef.current.push(prev);

        // After player moves, if AI mode and game not over, trigger AI thinking
        // AI plays when it's the turn of the side the player didn't choose
        if (
          next.gameMode === 'ai' &&
          !next.winner &&
          next.currentPlayer !== next.playerSide
        ) {
          return { ...next, isThinking: true };
        }

        return next;
      });
    },
    []
  );

  // AI move effect
  useEffect(() => {
    if (!state.isThinking || state.winner) return;

    const timer = setTimeout(() => {
      setState((prev) => {
        const bestMove = findMoveByDifficulty(prev);
        if (!bestMove) return { ...prev, isThinking: false };

        const next = placePiece(prev, bestMove);
        if (!next) return { ...prev, isThinking: false };

        // AI 走棋成功，将旧状态推入历史栈
        historyRef.current.push(prev);
        return next;
      });
    }, 400);

    aiTimerRef.current = timer;

    return () => clearTimeout(timer);
  }, [state.isThinking, state.winner]);

  /**
   * 悔棋
   * - PVP 模式：回退 1 步，撤销上一个人的落子
   * - AI 模式：回溯到玩家上一次决策时
   *   - AI 正在思考：取消思考 + 回退 1 步（撤销玩家刚走的）
   *   - AI 已走完：回退 2 步（撤销 AI + 玩家的整轮操作）
   *
   * 使用函数式 setState 从 currentState 读取最新值，避免闭包过期问题。
   */
  const undoMove = useCallback(() => {
    setState((currentState) => {
      const history = historyRef.current;

      // ── AI 正在思考 → 取消思考，回退玩家刚走的一步 ──
      if (currentState.isThinking && !currentState.winner) {
        if (aiTimerRef.current) {
          clearTimeout(aiTimerRef.current);
          aiTimerRef.current = null;
        }
        if (history.length > 0) {
          return { ...history.pop()!, isThinking: false };
        }
        return currentState;
      }

      if (history.length === 0) return currentState;

      // ── PVP 模式：回退 1 步 ──
      if (currentState.gameMode === 'pvp') {
        return history.pop()!;
      }

      // ── AI 模式（AI 已走完）：回退 2 步，回到玩家上一次决策时 ──
      if (history.length >= 2) {
        history.pop(); // 丢弃 AI 走棋前的状态
        return history.pop()!; // 恢复到玩家走棋前的状态
      }
      // 历史不够 2 步（如 AI 先手只走了一轮），回退 1 步
      return history.pop()!;
    });
  }, []);

  // 是否可悔棋：历史栈非空 OR AI 正在思考
  const canUndo =
    historyRef.current.length > 0 || (state.isThinking && !state.winner);

  const resetGame = useCallback(() => {
    clearHistory();
    setState((prev) =>
      createInitialState(prev.gameMode, prev.aiDifficulty, prev.playerSide)
    );
  }, [clearHistory]);

  const setMode = useCallback((mode: 'pvp' | 'ai') => {
    clearHistory();
    setState((prev) => createInitialState(mode, prev.aiDifficulty, prev.playerSide));
  }, [clearHistory]);

  const setDifficulty = useCallback((difficulty: AIDifficulty) => {
    clearHistory();
    setState((prev) =>
      createInitialState(prev.gameMode, difficulty, prev.playerSide)
    );
  }, [clearHistory]);

  const setPlayerSide = useCallback((side: Player) => {
    clearHistory();
    setState((prev) =>
      createInitialState(prev.gameMode, prev.aiDifficulty, side)
    );
  }, [clearHistory]);

  return {
    state,
    placePiece: handlePlacePiece,
    undoMove,
    canUndo,
    resetGame,
    setMode,
    setDifficulty,
    setPlayerSide,
  };
}
