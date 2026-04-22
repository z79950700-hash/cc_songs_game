import { useState, useEffect, useRef } from 'react';
import { SONGS } from '../data/songs';
import type { Song } from '../data/songs';
import { proxyUrl, extractDominantColor } from '../utils/color';
import { logArt } from '../utils/artLogger';

// ===== TYPES =====

export interface AlbumArtState {
  /** Mutable song objects with coverUrl / dominantColor populated at runtime */
  songs: Song[];
  /** 0–100 fetch progress */
  progress: number;
  /** true once all album queries have settled */
  done: boolean;
}

// ===== FETCH HELPERS =====

const MAYDAY_NAMES = ['五月天', 'mayday'];
function isMayday(names: string[]): boolean {
  return names.some(n => MAYDAY_NAMES.some(m => n.toLowerCase().includes(m)));
}

// Spotify token cache
let spotifyToken: string | null = null;
let spotifyTokenExpiry = 0;

async function getSpotifyToken(): Promise<string | null> {
  if (spotifyToken && Date.now() < spotifyTokenExpiry) return spotifyToken;
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  try {
    const resp = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
      signal: AbortSignal.timeout(8000),
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    spotifyToken = data.access_token;
    spotifyTokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
    return spotifyToken;
  } catch {
    return null;
  }
}

// Source 1: Spotify API (direct, no proxy needed, stable)
async function fetchArtFromSpotify(albumName: string): Promise<string | null> {
  try {
    const token = await getSpotifyToken();
    if (!token) {
      logArt({ album: albumName, source: 'Spotify', status: 'fail', detail: 'no token (env vars missing or request failed)' });
      return null;
    }
    const q = encodeURIComponent(`五月天 ${albumName}`);
    const resp = await fetch(
      `https://api.spotify.com/v1/search?q=${q}&type=album&market=TW&limit=5`,
      {
        headers: { 'Authorization': `Bearer ${token}` },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!resp.ok) {
      logArt({ album: albumName, source: 'Spotify', status: 'fail', detail: `HTTP ${resp.status}` });
      return null;
    }
    const data = await resp.json();
    const items: Array<{ images: Array<{ url: string }>; artists: Array<{ name: string }> }>
      = data?.albums?.items ?? [];
    if (!items.length) {
      logArt({ album: albumName, source: 'Spotify', status: 'fail', detail: '0 results' });
      return null;
    }
    const matched = items.find(item => isMayday(item.artists.map(a => a.name)));
    if (!matched) {
      const artistNames = items.map(i => i.artists.map(a => a.name).join('/')).join(', ');
      logArt({ album: albumName, source: 'Spotify', status: 'fail', detail: `artist filter excluded all ${items.length} results (got: ${artistNames}) → skipping` });
      return null;
    }
    logArt({ album: albumName, source: 'Spotify', status: 'ok', detail: `artist="${matched.artists.map(a => a.name).join('/')}" url=${matched.images[0]?.url}` });
    return matched.images[0]?.url ?? null;
  } catch (e) {
    logArt({ album: albumName, source: 'Spotify', status: 'fail', detail: `exception: ${e}` });
    return null;
  }
}

// Source 2: NetEase Cloud Music album search (dual-proxy race via Promise.any)
async function fetchArtFromNetease(albumName: string, year: number): Promise<string | null> {
  try {
    const searchUrl = `https://music.163.com/api/search/get?s=${encodeURIComponent('五月天 ' + albumName)}&type=10&offset=0&total=true&limit=8`;
    const proxies = [
      'https://api.allorigins.win/raw?url=' + encodeURIComponent(searchUrl),
      'https://corsproxy.io/?' + encodeURIComponent(searchUrl),
    ];
    let data: unknown;
    try {
      data = await Promise.any(
        proxies.map(url =>
          fetch(url, { signal: AbortSignal.timeout(8000) }).then(r => {
            if (!r.ok) throw new Error(String(r.status));
            return r.json();
          })
        )
      );
    } catch (e) {
      logArt({ album: albumName, source: 'NetEase', status: 'fail', detail: `both proxies failed: ${e}` });
      return null;
    }
    const albums: Array<{ picUrl?: string; publishTime?: number; artists?: Array<{ name: string }> }>
      = (data as { result?: { albums?: unknown[] } })?.result?.albums as typeof albums ?? [];
    if (!albums.length) {
      logArt({ album: albumName, source: 'NetEase', status: 'fail', detail: '0 results from API' });
      return null;
    }

    const pool = albums.filter(a => isMayday((a.artists ?? []).map(x => x.name)));
    const usedFallback = pool.length === 0;
    const candidates = usedFallback ? albums : pool;
    const best = candidates.sort((a, b) => {
      const ya = Math.abs((a.publishTime ? new Date(a.publishTime).getFullYear() : 0) - year);
      const yb = Math.abs((b.publishTime ? new Date(b.publishTime).getFullYear() : 0) - year);
      return ya - yb;
    })[0];

    if (!best.picUrl) {
      logArt({ album: albumName, source: 'NetEase', status: 'fail', detail: 'best result has no picUrl' });
      return null;
    }
    if (usedFallback) {
      const artistNames = albums.slice(0, 3).map(a => (a.artists ?? []).map(x => x.name).join('/')).join(', ');
      logArt({ album: albumName, source: 'NetEase', status: 'ok', detail: `artist filter excluded all ${albums.length} (got: ${artistNames}) → used year-closest fallback` });
    } else {
      logArt({ album: albumName, source: 'NetEase', status: 'ok', detail: `matched ${pool.length}/${albums.length} by artist` });
    }
    return best.picUrl + '?param=600y600';
  } catch (e) {
    logArt({ album: albumName, source: 'NetEase', status: 'fail', detail: `exception: ${e}` });
    return null;
  }
}

// Source 3: iTunes Search API (last resort)
async function fetchArtFromItunes(albumName: string, year: number): Promise<string | null> {
  const queries = [`五月天 ${albumName}`, `Mayday ${albumName}`, '五月天'];
  for (const q of queries) {
    try {
      const resp = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=album&limit=8&media=music&country=tw`,
        { signal: AbortSignal.timeout(8000) }
      );
      if (!resp.ok) {
        logArt({ album: albumName, source: 'iTunes', status: 'fail', detail: `q="${q}" HTTP ${resp.status}` });
        continue;
      }
      const data = await resp.json();
      if (!data.results?.length) {
        logArt({ album: albumName, source: 'iTunes', status: 'fail', detail: `q="${q}" 0 results` });
        continue;
      }
      const all = data.results as Array<{ artworkUrl100: string; releaseDate?: string; artistName?: string }>;
      const pool = all.filter(r => isMayday([r.artistName ?? '']));
      const usedFallback = pool.length === 0;
      const candidates = usedFallback ? all : pool;
      const best = candidates.sort((a, b) => {
        const ya = Math.abs(parseInt(a.releaseDate ?? '0') - year);
        const yb = Math.abs(parseInt(b.releaseDate ?? '0') - year);
        return ya - yb;
      })[0];
      const note = usedFallback
        ? `artist filter excluded all ${all.length} (artists: ${all.slice(0,3).map(r => r.artistName).join(', ')}) → used fallback`
        : `matched ${pool.length}/${all.length} by artist`;
      logArt({ album: albumName, source: 'iTunes', status: 'ok', detail: `q="${q}" ${note}` });
      return best.artworkUrl100.replace('100x100bb', '600x600bb');
    } catch (e) {
      logArt({ album: albumName, source: 'iTunes', status: 'fail', detail: `q="${q}" exception: ${e}` });
    }
  }
  logArt({ album: albumName, source: 'iTunes', status: 'fail', detail: 'all queries exhausted' });
  return null;
}

async function fetchArtForAlbum(albumName: string, year: number): Promise<string | null> {
  const result =
    (await fetchArtFromSpotify(albumName)) ??
    (await fetchArtFromNetease(albumName, year)) ??
    (await fetchArtFromItunes(albumName, year));
  if (!result) {
    logArt({ album: albumName, source: 'FINAL', status: 'fail', detail: 'all three sources failed — no cover art' });
  } else {
    logArt({ album: albumName, source: 'FINAL', status: 'ok', detail: 'cover loaded successfully' });
  }
  return result;
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
