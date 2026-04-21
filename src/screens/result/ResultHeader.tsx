import type { Song } from '../../data/songs';

interface ResultHeaderProps {
  song: Song;
}

export default function ResultHeader({ song }: ResultHeaderProps) {
  const winnerColor = song.dominantColor || song.color;

  return (
    <div
      className="result-content"
      style={{ '--winner-color': winnerColor } as React.CSSProperties}
    >
      <div className="result-eyebrow">15 轮直觉对决</div>
      <div className="result-label">你最爱的五月天歌曲是</div>
      <div className="result-title">{song.title}</div>
      <div className="result-album">
        {song.album}&nbsp;·&nbsp;{song.year}
      </div>
      <div className="result-divider" />
    </div>
  );
}
