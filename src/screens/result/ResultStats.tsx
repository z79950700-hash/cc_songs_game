import type { Song } from '../../data/songs';

interface ResultStatsProps {
  song: Song;
  wins: number;
  firstWinRound: number;
}

export default function ResultStats({ song, wins, firstWinRound }: ResultStatsProps) {
  const totalYears = new Date().getFullYear() - song.year;

  return (
    <div className="result-section">
      <div className="result-section-title">这首歌与你</div>
      <div className="result-stats-grid">
        <div className="stat-cell">
          <div className="stat-value">{wins}</div>
          <div className="stat-label">轮对决胜出</div>
        </div>
        <div className="stat-cell">
          <div className="stat-value">第 {firstWinRound}</div>
          <div className="stat-label">轮首次选择</div>
        </div>
        <div className="stat-cell">
          <div className="stat-value">{totalYears}</div>
          <div className="stat-label">年前发行</div>
        </div>
      </div>
    </div>
  );
}
