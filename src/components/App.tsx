import { useGameState } from '../hooks/useGameState';
import { getWinningLine } from '../logic/gameEngine';
import Board from './Board';
import GameStatus from './GameStatus';
import ModeSelector from './ModeSelector';
import QueueIndicator from './QueueIndicator';
import ResetButton from './ResetButton';
import '../styles/app.css';

export default function App() {
  const { state, placePiece, resetGame, setMode, setDifficulty, setPlayerSide } =
    useGameState('pvp');

  const isDisabled =
    state.isThinking || state.winner !== null;

  const winLine = state.winner
    ? getWinningLine(state.board, state.winner)
    : null;
  const winCells = winLine?.cells ?? [];

  return (
    <div className="app-container">
      <h1 className="app-title">Moon Chess</h1>
      <p className="app-subtitle">消失井字棋 · Vanishing Tic-Tac-Toe</p>

      <ModeSelector
        currentMode={state.gameMode}
        currentDifficulty={state.aiDifficulty}
        currentPlayerSide={state.playerSide}
        onSelectMode={setMode}
        onSelectDifficulty={setDifficulty}
        onSelectPlayerSide={setPlayerSide}
      />

      <div className="game-area">
        <div className="players-row">
          <QueueIndicator
            player="red"
            queue={state.redQueue}
            label="红方"
          />
          <div className="center-column">
            <GameStatus
              currentPlayer={state.currentPlayer}
              winner={state.winner}
              isThinking={state.isThinking}
            />
            <Board
              board={state.board}
              redQueue={state.redQueue}
              blueQueue={state.blueQueue}
              winCells={winCells}
              disabled={isDisabled}
              onCellClick={placePiece}
            />
            <div className="action-row">
              <ResetButton
                onClick={resetGame}
                visible={state.winner !== null || true}
              />
            </div>
          </div>
          <QueueIndicator
            player="blue"
            queue={state.blueQueue}
            label="蓝方"
          />
        </div>
      </div>

      <div className="rules-hint">
        <p>每方最多保留 3 枚棋子，下第 4 枚时最早的一枚自动消失</p>
        <p>放置后先处理消失，再判定胜负 — 横、竖、斜连成 3 子即胜</p>
      </div>
    </div>
  );
}
