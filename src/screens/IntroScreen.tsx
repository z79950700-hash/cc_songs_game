import { useMemo } from 'react';

interface IntroScreenProps {
  onStart: () => void;
  ready: boolean;
}

interface ParticleConfig {
  left: number;
  dur: number;
  delay: number;
  size: number;
  drift: number;
  color: string;
}

export default function IntroScreen({ onStart, ready }: IntroScreenProps) {
  const particles = useMemo<ParticleConfig[]>(() => {
    return Array.from({ length: 55 }, () => {
      const warm = Math.random() < 0.3;
      return {
        left: Math.random() * 100,
        dur: 8 + Math.random() * 14,
        delay: Math.random() * 12,
        size: 1 + Math.random() * 2.5,
        drift: (Math.random() - 0.5) * 80,
        color: warm
          ? `rgba(255,${130 + Math.floor(Math.random() * 80)},40,0.75)`
          : `rgba(255,255,255,${0.4 + Math.random() * 0.4})`,
      };
    });
  }, []);

  return (
    <div className="intro-screen screen-fade-enter">
      {/* Particles */}
      <div className="intro-particles">
        {particles.map((p, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${p.left}%`,
              bottom: '-5px',
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDuration: `${p.dur}s`,
              animationDelay: `-${p.delay}s`,
              '--drift': `${p.drift}px`,
              background: p.color,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Band meta */}
      <div className="intro-meta">
        <span>1999</span>
        <span className="intro-meta-dot">✦</span>
        <span>MAYDAY 五月天</span>
        <span className="intro-meta-dot">✦</span>
        <span>26年</span>
      </div>

      {/* Mascot */}
      <div className="intro-mascot">
        <div className="intro-mascot-glow" />
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 118" width="90" height="118">
          {/* Leaves */}
          <path d="M40 30 C33 21 17 17 15 25 C24 23 33 26 40 30Z" fill="#52b04a"/>
          <path d="M40 28 C37 15 35 4 37 0 C38 9 39 19 40 28Z" fill="#48a040"/>
          <path d="M40 26 C40 11 40 1 40 0 C40 1 40 11 40 26Z" fill="#5cc054" stroke="#48a040" strokeWidth="0.8"/>
          <path d="M40 28 C43 15 45 4 43 0 C42 9 41 19 40 28Z" fill="#48a040"/>
          <path d="M40 30 C47 21 63 17 65 25 C56 23 47 26 40 30Z" fill="#52b04a"/>
          {/* Carrot body */}
          <path d="M31 30 Q23 58 26 80 Q32 102 40 115 Q48 102 54 80 Q57 58 49 30 Z" fill="#ff7800"/>
          {/* Highlight stripe */}
          <path d="M35 35 Q33 60 35 78" stroke="rgba(255,210,110,0.35)" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
          {/* Texture lines */}
          <path d="M34 47 Q40 45 46 47" stroke="#d96200" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          <path d="M32 62 Q40 60 48 62" stroke="#d96200" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          <path d="M33 77 Q40 75 47 77" stroke="#d96200" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          {/* Sparkle left */}
          <g transform="translate(8,42) scale(0.9)">
            <line x1="0" y1="-7" x2="0" y2="7" stroke="#ffd060" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="-7" y1="0" x2="7" y2="0" stroke="#ffd060" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="-5" y1="-5" x2="5" y2="5" stroke="#ffd060" strokeWidth="0.8" strokeLinecap="round"/>
            <line x1="5" y1="-5" x2="-5" y2="5" stroke="#ffd060" strokeWidth="0.8" strokeLinecap="round"/>
          </g>
          {/* Sparkle right small */}
          <g transform="translate(66,35) scale(0.6)">
            <line x1="0" y1="-7" x2="0" y2="7" stroke="#ffd060" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="-7" y1="0" x2="7" y2="0" stroke="#ffd060" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="-5" y1="-5" x2="5" y2="5" stroke="#ffd060" strokeWidth="0.8" strokeLinecap="round"/>
            <line x1="5" y1="-5" x2="-5" y2="5" stroke="#ffd060" strokeWidth="0.8" strokeLinecap="round"/>
          </g>
          {/* Dot accents */}
          <circle cx="18" cy="62" r="2" fill="#ffd060" opacity="0.7"/>
          <circle cx="64" cy="58" r="1.5" fill="#ffd060" opacity="0.6"/>
        </svg>
      </div>

      <div className="intro-title">
        你心中<br />那首歌
      </div>
      <div className="intro-subtitle">
        五月天唱了 26 年的故事里<br />有一首，是为你而生的
      </div>

      <button
        className="intro-btn"
        disabled={!ready}
        onClick={ready ? onStart : undefined}
      >
        {ready ? '开始寻找 →' : '专辑封面加载中…'}
      </button>

      <div style={{ position: 'absolute', bottom: 8, right: 12, fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)', pointerEvents: 'none' }}>v-debug-b1b9cab</div>

      <div className="intro-rules">
        Top 50 热门歌曲 · 15 轮直觉对决 · 每次答案都是真实的你
      </div>
    </div>
  );
}
