import { useState } from 'react';
import type { Song } from '../data/songs';
import { proxyUrl, adjustColor } from '../utils/color';

interface LoadingScreenProps {
  song: Song;
}

export default function LoadingScreen({ song }: LoadingScreenProps) {
  const [imgError, setImgError] = useState(false);

  const base = song.dominantColor || song.color;
  const coverSrc = song.coverUrl ? proxyUrl(song.coverUrl) : '';
  const fallbackGradient = `linear-gradient(145deg,${adjustColor(base, 60)} 0%,${base} 55%,${adjustColor(base, -50)} 100%)`;

  // Show fallback div when: no coverSrc at all, or image failed to load
  const showFallback = !coverSrc || imgError;

  return (
    <div className="loading-screen screen-fade-enter">
      <div
        className="loading-bg"
        style={
          coverSrc && !imgError
            ? { backgroundImage: `url(${coverSrc})` }
            : { background: fallbackGradient }
        }
      />
      {showFallback ? (
        <div
          className="loading-cover loading-cover--fallback"
          style={{ background: fallbackGradient }}
        />
      ) : (
        <img
          className="loading-cover"
          src={coverSrc}
          alt={song.title}
          crossOrigin="anonymous"
          onError={() => setImgError(true)}
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
