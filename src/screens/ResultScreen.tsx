import { useEffect } from 'react';
import type { Song } from '../data/songs';
import type { HistoryEntry } from '../types/game';
import { SONGS, AWARDS } from '../data/songs';
import { proxyUrl, adjustColor } from '../utils/color';
import ResultHeader from './result/ResultHeader';
import ResultLyrics from './result/ResultLyrics';
import ResultStory from './result/ResultStory';
import ResultStats from './result/ResultStats';
import ResultAwards from './result/ResultAwards';
import ResultTimeline from './result/ResultTimeline';
import ResultSameAlbum from './result/ResultSameAlbum';
import ResultRestart from './result/ResultRestart';

interface ResultScreenProps {
  winner: Song;
  wins: number;
  history: HistoryEntry[];
  audioUrl: string | null;
  onRestart: () => void;
  playAudio: (url: string, loop?: boolean) => void;
  pauseAudio: () => void;
}

export default function ResultScreen({
  winner,
  wins,
  history,
  audioUrl,
  onRestart,
  playAudio,
  pauseAudio,
}: ResultScreenProps) {
  const winnerColor = winner.dominantColor || winner.color;
  const base = winnerColor;
  const coverSrc = winner.coverUrl ? proxyUrl(winner.coverUrl) : '';
  const fallbackGradient = `linear-gradient(145deg,${adjustColor(base, 60)} 0%,${base} 55%,${adjustColor(base, -50)} 100%)`;

  // Start background audio when the result screen mounts
  useEffect(() => {
    if (!audioUrl) return;
    const isPreview =
      audioUrl.includes('itunes.apple.com') ||
      audioUrl.includes('mzstatic.com');
    playAudio(audioUrl, isPreview);
    return () => {
      pauseAudio();
    };
  }, [audioUrl, playAudio, pauseAudio]);

  // Derived data
  const defeatedSongs: Song[] = history
    .filter((h) => h.winner.id === winner.id)
    .map((h) => h.loser);

  const firstWinRound =
    (history.findIndex((h) => h.winner.id === winner.id) ?? -1) + 1;

  const sameAlbum = SONGS.filter(
    (s) => s.album === winner.album && s.id !== winner.id
  ).slice(0, 5);

  const awards: string[] = AWARDS[winner.id] ?? [];

  const totalYears = new Date().getFullYear() - winner.year;

  return (
    <div
      className="result-screen screen-fade-enter"
      style={{ '--winner-color': winnerColor } as React.CSSProperties}
    >
      {/* Blurred background */}
      <div
        className="result-bg"
        style={
          coverSrc
            ? { backgroundImage: `url(${coverSrc})` }
            : { background: fallbackGradient }
        }
      />
      <div className="result-bg-overlay" />

      <div className="result-scroll">
        {/* Header: title + album + divider */}
        <ResultHeader song={winner} />

        {/* Lyrics typewriter */}
        <div
          className="result-content"
          style={{ '--winner-color': winnerColor } as React.CSSProperties}
        >
          <ResultLyrics text={winner.lyricsExcerpt} winnerColor={winnerColor} />
          <ResultStory text={winner.backgroundStory} />
        </div>

        <div className="scroll-hint">↓ 向下滑动 ↓</div>

        {/* Stats */}
        <div className="result-section-divider" />
        <ResultStats song={winner} wins={wins} firstWinRound={firstWinRound} />

        {/* Awards */}
        <ResultAwards awards={awards} />

        {/* "Why this song" narrative section */}
        <div className="result-section-divider" />
        <div className="result-section" style={{ textAlign: 'left' }}>
          <div className="result-section-title" style={{ textAlign: 'center' }}>
            为什么是这首
          </div>
          <div
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '.9rem',
              color: 'rgba(255,255,255,.55)',
              lineHeight: 2,
            }}
          >
            <p style={{ marginBottom: '1rem' }}>
              在所有五月天的歌曲里，你的直觉选择了《
              <em style={{ color: 'rgba(255,255,255,.8)' }}>{winner.title}</em>》。
              它发行于 {winner.year} 年，收录在专辑《{winner.album}》中，距今已陪伴歌迷走过{' '}
              {totalYears} 年。
            </p>
            <p style={{ marginBottom: '1rem' }}>{winner.backgroundStory}</p>
            <p
              style={{
                color: 'rgba(255,255,255,.35)',
                fontStyle: 'italic',
                fontSize: '.82rem',
              }}
            >
              「直觉是最诚实的答案。在 15 次选择里，你总是回到这里。」
            </p>
          </div>
        </div>

        {/* Defeated + same album */}
        <ResultSameAlbum songs={sameAlbum} defeatedSongs={defeatedSongs} />

        {/* Battle timeline */}
        <ResultTimeline history={history} winner={winner} />

        {/* Restart */}
        <ResultRestart onRestart={onRestart} />
      </div>
    </div>
  );
}
