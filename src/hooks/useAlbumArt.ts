import { useState, useEffect, useRef } from 'react';
import { SONGS } from '../data/songs';
import type { Song } from '../data/songs';
import { proxyUrl, extractDominantColor } from '../utils/color';

// ===== TYPES =====

export interface AlbumArtState {
  /** Mutable song objects with coverUrl / dominantColor populated at runtime */
  songs: Song[];
  /** 0–100 fetch progress */
  progress: number;
  /** true once all album queries have settled */
  done: boolean;
}

// ===== ITUNES FETCH HELPERS =====

async function fetchArtForAlbum(
  albumName: string,
  year: number,
  signal: AbortSignal
): Promise<string | null> {
  // Three-tier fallback matching the original prefetchAlbumArt logic:
  // 1. "五月天 <album>"  2. "Mayday <album>"  3. "五月天" (artist-only)
  const queries = [`五月天 ${albumName}`, `Mayday ${albumName}`, '五月天'];

  for (const q of queries) {
    try {
      const resp = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=album&limit=8&media=music&country=tw`,
        { signal: AbortSignal.any([signal, AbortSignal.timeout(8000)]) }
      );
      const data = await resp.json();
      if (!data.results?.length) continue;

      // Prefer the result whose release year is closest to the song's year
      const best: { artworkUrl100: string; releaseDate?: string } = (
        data.results as Array<{
          artworkUrl100: string;
          releaseDate?: string;
        }>
      ).sort((a, b) => {
        const ya = Math.abs(
          parseInt(a.releaseDate ?? '0') - year
        );
        const yb = Math.abs(
          parseInt(b.releaseDate ?? '0') - year
        );
        return ya - yb;
      })[0];

      return best.artworkUrl100.replace('100x100bb', '600x600bb');
    } catch {
      // CORS / network / abort — try next query
    }
  }
  return null;
}

// ===== HOOK =====

export function useAlbumArt(enabled: boolean): AlbumArtState {
  // Working copy of SONGS — mutated in-place (same pattern as the original
  // prefetchAlbumArt) then stored in state so React re-renders.
  const [songs, setSongs] = useState<Song[]>(() =>
    SONGS.map((s) => ({ ...s }))
  );
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  // Keep a ref to the abort controller so we can cancel on unmount
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();
    abortRef.current = controller;
    const { signal } = controller;

    async function run() {
      // Deduplicate albums
      const seen = new Set<string>();
      const uniqueAlbums = SONGS.filter((s) => {
        if (seen.has(s.album)) return false;
        seen.add(s.album);
        return true;
      });

      let completed = 0;
      const total = uniqueAlbums.length;

      // Working copy shared across this effect run
      const working: Song[] = SONGS.map((s) => ({ ...s }));

      await Promise.allSettled(
        uniqueAlbums.map(async (ref) => {
          if (signal.aborted) return;
          try {
            const art = await fetchArtForAlbum(
              ref.album,
              ref.year,
              signal
            );
            if (art) {
              // Stamp every song on the same album
              working.forEach((s) => {
                if (s.album === ref.album) s.coverUrl = art;
              });

              // Extract dominant colour via canvas (weserv proxy adds CORS headers)
              const purl = proxyUrl(art);
              const dominant = await extractDominantColor(purl);
              if (dominant) {
                working.forEach((s) => {
                  if (s.album === ref.album) s.dominantColor = dominant;
                });
              }
            }
          } catch {
            // Keep gradient fallback — no action needed
          } finally {
            completed++;
            if (!signal.aborted) {
              setProgress(Math.round((completed / total) * 100));
              // Publish intermediate updates so LoadingScreen can show
              // partial artwork as it arrives.
              setSongs([...working]);
            }
          }
        })
      );

      if (!signal.aborted) {
        setSongs([...working]);
        setProgress(100);
        setDone(true);
      }
    }

    run();

    return () => {
      controller.abort();
    };
  }, [enabled]);

  return { songs, progress, done };
}
