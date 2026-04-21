import { useRef, useCallback } from 'react';
import type { Song } from '../data/songs';

// ===== FETCH SONG AUDIO =====
// Mirrors the original fetchSongAudio() function:
//   1. NetEase full track via allorigins CORS proxy
//   2. iTunes 30-second preview as fallback
// Returns the audio URL string, or null if both sources fail.

export async function fetchSongAudio(song: Song): Promise<string | null> {
  // --- Source 1: NetEase full track ---
  try {
    const searchUrl =
      'https://music.163.com/api/search/get?s=' +
      encodeURIComponent('五月天 ' + song.title) +
      '&type=1&offset=0&total=true&limit=5';

    const res = await fetch(
      'https://api.allorigins.win/raw?url=' + encodeURIComponent(searchUrl),
      { signal: AbortSignal.timeout(6000) }
    );
    const data = await res.json();
    const id: number | undefined = data?.result?.songs?.[0]?.id;
    if (id) return `https://music.163.com/song/media/outer/url?id=${id}`;
  } catch {
    // fall through to iTunes
  }

  // --- Source 2: iTunes 30-second preview ---
  try {
    const q = encodeURIComponent('五月天 ' + song.title);
    const res = await fetch(
      `https://itunes.apple.com/search?term=${q}&entity=song&limit=10&media=music&country=tw`,
      { signal: AbortSignal.timeout(8000) }
    );
    const data = await res.json();

    type ItunesResult = { previewUrl?: string; artistName: string };
    const results: ItunesResult[] = data.results ?? [];

    const match =
      results.find(
        (r) =>
          r.previewUrl &&
          (r.artistName.includes('五月天') ||
            r.artistName.toLowerCase().includes('mayday'))
      ) ?? results.find((r) => r.previewUrl);

    if (match?.previewUrl) return match.previewUrl;
  } catch {
    // both sources failed
  }

  return null;
}

// ===== HOOK =====

export interface AudioControls {
  /** Ref to the currently active Audio element (null when no audio is loaded) */
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  /** Start playback from a URL. Cleans up any previous Audio instance first. */
  play: (url: string, loop?: boolean) => void;
  /** Pause and release the current Audio instance. */
  pause: () => void;
}

export function useAudioPreload(): AudioControls {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  const play = useCallback(
    (url: string, loop = false) => {
      // Clean up any previous instance
      pause();

      const audio = new Audio(url);
      audio.loop = loop;
      audio.volume = 0.4;
      audio.play().catch(() => {
        // Autoplay blocked by browser — silently ignore
      });
      audioRef.current = audio;
    },
    [pause]
  );

  return { audioRef, play, pause };
}
