import type { Song } from '../data/songs';
import { proxyUrl, adjustColor } from '../utils/color';

interface LoadingScreenProps {
  song: Song;
}

export default function LoadingScreen({ song }: LoadingScreenProps) {
  const base = song.dominantColor || song.color;
  const coverSrc = song.coverUrl ? proxyUrl(song.coverUrl) : '';
  const fallbackGradient = `linear-gradient(145deg,${adjustColor(base, 60)} 0%,${base} 55%,${adjustColor(base, -50)} 100%)`;

  return (
    <div className="loading-screen screen-fade-enter">
      <div
        className="loading-bg"
        style={
          coverSrc
            ? { backgroundImage: `url(${coverSrc})` }
            : { background: fallbackGradient }
        }
      />
      {coverSrc ? (
        <img
          className="loading-cover"
          src={coverSrc}
          alt={song.title}
          crossOrigin="anonymous"
          onError={(e) => {
            const el = e.currentTarget;
            el.removeAttribute('src');
            el.style.cssText = `background:${fallbackGradient};width:140px;height:140px;border-radius:16px;position:relative;z-index:1;animation:loadingPulse 2s ease-in-out infinite`;
          }}
        />
      ) : (
        <div
          className="loading-cover"
          style={{ background: fallbackGradient }}
        />
      )}
      <div className="loading-title">{song.title}</div>
      <div className="loading-label">
        正在加载结果
        <span className="loading-dots">
          <span className="loading-dot" />
          <span className="loading-dot" />
          <span className="loading-dot" />
        </span>
      </div>
    </div>
  );
}
