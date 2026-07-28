import { AIDifficulty } from '../types/game';

interface ModeSelectorProps {
  currentMode: 'pvp' | 'ai';
  currentDifficulty: AIDifficulty;
  onSelectMode: (mode: 'pvp' | 'ai') => void;
  onSelectDifficulty: (difficulty: AIDifficulty) => void;
}

const difficultyLabels: Record<AIDifficulty, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
};

export default function ModeSelector({
  currentMode,
  currentDifficulty,
  onSelectMode,
  onSelectDifficulty,
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
      )}
    </div>
  );
}
