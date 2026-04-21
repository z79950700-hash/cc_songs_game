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
  const base = song.dominantColor || song.color;
  const purl = song.coverUrl ? proxyUrl(song.coverUrl) : '';
  const fallbackGradient = `linear-gradient(145deg,${adjustColor(base, 60)} 0%,${base} 55%,${adjustColor(base, -50)} 100%)`;

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
        {purl ? (
          <img
            className="card-album-thumb"
            src={purl}
            alt={song.album}
            crossOrigin="anonymous"
            onError={(e) => {
              const el = e.currentTarget;
              el.removeAttribute('src');
              el.style.cssText = `background:${fallbackGradient};width:220px;height:220px;border-radius:14px;display:block;margin:0 auto 1.5rem`;
            }}
          />
        ) : (
          <div
            className="card-album-thumb"
            style={{ background: fallbackGradient }}
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
