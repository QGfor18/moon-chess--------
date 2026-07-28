interface ModeSelectorProps {
  currentMode: 'pvp' | 'ai';
  onSelectMode: (mode: 'pvp' | 'ai') => void;
}

export default function ModeSelector({
  currentMode,
  onSelectMode,
}: ModeSelectorProps) {
  return (
    <div className="mode-selector">
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
  );
}
