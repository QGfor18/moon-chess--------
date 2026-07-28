import { AIDifficulty, Player } from '../types/game';

interface ModeSelectorProps {
  currentMode: 'pvp' | 'ai';
  currentDifficulty: AIDifficulty;
  currentPlayerSide: Player;
  onSelectMode: (mode: 'pvp' | 'ai') => void;
  onSelectDifficulty: (difficulty: AIDifficulty) => void;
  onSelectPlayerSide: (side: Player) => void;
}

const difficultyLabels: Record<AIDifficulty, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
};

const sideLabels: Record<Player, string> = {
  red: '🔴 红方',
  blue: '🔵 蓝方',
};

export default function ModeSelector({
  currentMode,
  currentDifficulty,
  currentPlayerSide,
  onSelectMode,
  onSelectDifficulty,
  onSelectPlayerSide,
}: ModeSelectorProps) {
  return (
    <div className="mode-selector">
      <div className="mode-buttons">
        <button
          className={`mode-btn ${currentMode === 'pvp' ? 'active' : ''}`}
          onClick={() => onSelectMode('pvp')}
        >
          双人对战
        </button>
        <button
          className={`mode-btn ${currentMode === 'ai' ? 'active' : ''}`}
          onClick={() => onSelectMode('ai')}
        >
          人机对战
        </button>
      </div>
      {currentMode === 'ai' && (
        <>
          <div className="side-selector">
            <span className="side-label">我方：</span>
            {(['red', 'blue'] as Player[]).map((s) => (
              <button
                key={s}
                className={`side-btn ${currentPlayerSide === s ? 'active' : ''}`}
                onClick={() => onSelectPlayerSide(s)}
              >
                {sideLabels[s]}
              </button>
            ))}
          </div>
          <div className="difficulty-selector">
            <span className="difficulty-label">难度：</span>
            {(['easy', 'medium', 'hard'] as AIDifficulty[]).map((d) => (
              <button
                key={d}
                className={`difficulty-btn ${currentDifficulty === d ? 'active' : ''}`}
                onClick={() => onSelectDifficulty(d)}
              >
                {difficultyLabels[d]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
