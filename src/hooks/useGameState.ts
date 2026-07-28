import { useState, useCallback, useEffect } from 'react';
import { AIDifficulty, GameState } from '../types/game';
import { createInitialState, placePiece } from '../logic/gameEngine';
import { findMoveByDifficulty } from '../logic/ai';
import { Position } from '../types/game';

export function useGameState(initialMode: 'pvp' | 'ai' = 'pvp') {
  const [state, setState] = useState<GameState>(() =>
    createInitialState(initialMode)
  );

  const handlePlacePiece = useCallback(
    (pos: Position) => {
      setState((prev) => {
        const next = placePiece(prev, pos);
        if (!next) return prev;

        // After player moves, if AI mode and game not over, trigger AI thinking
        if (
          next.gameMode === 'ai' &&
          !next.winner &&
          next.currentPlayer === 'blue'
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
        return next || { ...prev, isThinking: false };
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [state.isThinking, state.winner]);

  const resetGame = useCallback(() => {
    setState((prev) =>
      createInitialState(prev.gameMode, prev.aiDifficulty)
    );
  }, []);

  const setMode = useCallback((mode: 'pvp' | 'ai') => {
    setState((prev) => createInitialState(mode, prev.aiDifficulty));
  }, []);

  const setDifficulty = useCallback((difficulty: AIDifficulty) => {
    setState((prev) =>
      createInitialState(prev.gameMode, difficulty)
    );
  }, []);

  return {
    state,
    placePiece: handlePlacePiece,
    resetGame,
    setMode,
    setDifficulty,
  };
}
