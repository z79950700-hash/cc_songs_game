import type { HistoryEntry } from '../../types/game';
import type { Song } from '../../data/songs';

interface ResultTimelineProps {
  history: HistoryEntry[];
  winner: Song;
}

export default function ResultTimeline({ history, winner }: ResultTimelineProps) {
  return (
    <>
      <div className="result-section-divider" />
      <div className="result-section">
        <div className="result-section-title">15 轮对决回顾</div>
        <div className="battle-timeline">
          {history.map((h, i) => {
            const isWin = h.winner.id === winner.id;
            return (
              <div key={i} className="battle-round">
                <span className="battle-round-num">R{i + 1}</span>
                <span
                  className={isWin ? 'battle-winner-name' : ''}
                  style={!isWin ? { color: 'rgba(255,255,255,0.3)' } : undefined}
                >
                  {h.winner.title}
                </span>
                <span className="battle-vs">›</span>
                <span style={{ color: 'rgba(255,255,255,0.25)', textDecoration: 'line-through' }}>
                  {h.loser.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
