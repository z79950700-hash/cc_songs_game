import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Song } from '../data/songs';
import { proxyUrl, adjustColor } from '../utils/color';

interface SongCardProps {
  song: Song;
  side: 'left' | 'right';
  onPick: () => void;
  animating: boolean;
}

export default function SongCard({ song, side, onPick, animating }: SongCardProps) {
  const [imgError, setImgError] = useState(false);

  const base = song.dominantColor || song.color;
  const purl = song.coverUrl ? proxyUrl(song.coverUrl) : '';
  const fallbackGradient = `linear-gradient(145deg,${adjustColor(base, 60)} 0%,${base} 55%,${adjustColor(base, -50)} 100%)`;

  // Show fallback div when: no purl at all, or image failed to load
  const showFallback = !purl || imgError;

  return (
    <motion.div
      key={song.id}
      className={`song-card card-${side}`}
      initial={{ opacity: 0, y: -30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 30, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{ flex: 1, cursor: 'pointer' }}
      onClick={() => !animating && onPick()}
    >
      <div className="card-inner">
        {showFallback ? (
          <div
            className="card-album-thumb card-album-thumb--fallback"
            style={{ background: fallbackGradient }}
          />
        ) : (
          <img
            className="card-album-thumb"
            src={purl}
            alt={song.album}
            crossOrigin="anonymous"
            onError={() => setImgError(true)}
          />
        )}
        <div className="card-title">{song.title}</div>
        <div className="card-album">
          {song.album} · {song.year}
        </div>
        <button
          className="pick-btn"
          onClick={(e) => {
            e.stopPropagation();
            if (!animating) onPick();
          }}
        >
          选择这首 ♡
        </button>
      </div>
    </motion.div>
  );
}
