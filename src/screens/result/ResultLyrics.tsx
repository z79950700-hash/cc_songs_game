import { useState, useEffect, useRef } from 'react';

interface ResultLyricsProps {
  text: string;
  winnerColor: string;
}

export default function ResultLyrics({ text, winnerColor }: ResultLyricsProps) {
  const [displayed, setDisplayed] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDisplayed('');

    const chars = [...text];
    let i = 0;

    timerRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        i++;
        setDisplayed(chars.slice(0, i).join(''));
        if (i >= chars.length && intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }, 55);
    }, 600);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [text]);

  return (
    <div
      className="result-lyrics"
      style={{ borderLeftColor: winnerColor } as React.CSSProperties}
    >
      <div className="result-lyrics-text">{displayed}</div>
    </div>
  );
}
