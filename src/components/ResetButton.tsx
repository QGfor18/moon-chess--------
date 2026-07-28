interface ResetButtonProps {
  onClick: () => void;
  visible: boolean;
}

export default function ResetButton({ onClick, visible }: ResetButtonProps) {
  if (!visible) return null;

  return (
    <button className="reset-btn" onClick={onClick}>
      再来一局
    </button>
  );
}
