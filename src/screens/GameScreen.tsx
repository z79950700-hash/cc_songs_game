import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { Song } from '../data/songs';
import { adjustColor } from '../utils/color';
import SongCard from '../components/SongCard';

interface GameScreenProps {
  left: Song;
  right: Song;
  round: number;
  onPick: (side: 'left' | 'right') => void;
}

export default function GameScreen({ left, right, round, onPick }: GameScreenProps) {
  const [hover, setHover] = useState<'left' | 'right' | null>(null);
  const [animating, setAnimating] = useState(false);

  const handlePick = useCallback(
    (side: 'left' | 'right') => {
      if (animating) return;
      setAnimating(true);
      setHover(null);
      setTimeout(() => {
        onPick(side);
        setAnimating(false);
      }, 300);
    },
    [animating, onPick]
  );

  const lc = left.dominantColor || left.color;
  const rc = right.dominantColor || right.color;

  const bgLeftStyle = {
    background: `radial-gradient(ellipse at 35% 50%, ${adjustColor(lc, 60)} 0%, ${lc} 45%, ${adjustColor(lc, -60)} 100%)`,
  };
  const bgRightStyle = {
    background: `radial-gradient(ellipse at 65% 50%, ${adjustColor(rc, 60)} 0%, ${rc} 45%, ${adjustColor(rc, -60)} 100%)`,
  };

  // Disable flex expand on touch devices
  const isTouch = window.matchMedia('(hover: none)').matches;
  const leftFlex = !isTouch && hover === 'left' ? 1.24 : !isTouch && hover === 'right' ? 0.76 : 1;
  const rightFlex = !isTouch && hover === 'right' ? 1.24 : !isTouch && hover === 'left' ? 0.76 : 1;
  const transition = 'flex var(--transition-speed) cubic-bezier(.4,0,.2,1)';

  const screenClass = [
    'game-screen',
    'screen-fade-enter',
    hover === 'left' ? 'hover-left' : '',
    hover === 'right' ? 'hover-right' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={screenClass}
      style={
        {
          '--color-left': left.color,
          '--color-right': right.color,
        } as React.CSSProperties
      }
    >
      {/* Background layers */}
      <div className="bg-layer bg-left" style={bgLeftStyle} />
      <div className="bg-layer bg-right" style={bgRightStyle} />

      {/* Center seam */}
      <div className="seam" />

      {/* Round counter */}
      <div className="round-counter">
        <div className="round-text">第 {round + 1} / 15 轮</div>
        <div className="round-bar">
          <div
            className="round-fill"
            style={{ width: `${(round / 15) * 100}%` }}
          />
        </div>
      </div>

      {/* VS badge */}
      <div className="vs-badge">VS</div>

      {/* Cards */}
      <div className="cards-container">
        {/* Left slot */}
        <div
          onMouseEnter={() => setHover('left')}
          onMouseLeave={() => setHover(null)}
          style={{ flex: leftFlex, transition, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <AnimatePresence mode="wait">
            <SongCard
              key={left.id}
              song={left}
              side="left"
              onPick={() => handlePick('left')}
              animating={animating}
            />
          </AnimatePresence>
        </div>

        {/* Right slot */}
        <div
          onMouseEnter={() => setHover('right')}
          onMouseLeave={() => setHover(null)}
          style={{ flex: rightFlex, transition, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <AnimatePresence mode="wait">
            <SongCard
              key={right.id}
              song={right}
              side="right"
              onPick={() => handlePick('right')}
              animating={animating}
            />
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
