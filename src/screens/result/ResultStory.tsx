import { useState, useEffect } from 'react';

interface ResultStoryProps {
  text: string;
}

export default function ResultStory({ text }: ResultStoryProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(false);
    // Fade in after 2200ms (matching original timing)
    const t = setTimeout(() => setVisible(true), 2200);
    return () => clearTimeout(t);
  }, [text]);

  return (
    <div className={`result-story${visible ? ' visible' : ''}`}>
      {text}
    </div>
  );
}
