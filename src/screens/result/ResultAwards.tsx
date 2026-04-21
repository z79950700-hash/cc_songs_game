interface ResultAwardsProps {
  awards: string[];
}

export default function ResultAwards({ awards }: ResultAwardsProps) {
  if (!awards.length) return null;

  return (
    <>
      <div className="result-section-divider" />
      <div className="result-section">
        <div className="result-section-title">奖项与认可</div>
        <div className="result-awards-list">
          {awards.map((a, i) => (
            <div key={i} className="result-award-item">
              <span className="result-award-star">★</span>
              <span>{a}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
