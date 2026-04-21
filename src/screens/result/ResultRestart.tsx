interface ResultRestartProps {
  onRestart: () => void;
}

export default function ResultRestart({ onRestart }: ResultRestartProps) {
  return (
    <>
      <div className="result-section-divider" />
      <div className="result-section" style={{ textAlign: 'center', paddingBottom: '2rem' }}>
        <div
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '.85rem',
            color: 'rgba(255,255,255,.3)',
            marginBottom: '1.5rem',
          }}
        >
          每一次游戏，答案都可能不同——那才是真实的你
        </div>
        <button className="result-btn" onClick={onRestart}>
          再玩一次
        </button>
      </div>
    </>
  );
}
