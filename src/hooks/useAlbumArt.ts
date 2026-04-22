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
    if (!token) return null;
    const q = encodeURIComponent(`五月天 ${albumName}`);
    const resp = await fetch(
      `https://api.spotify.com/v1/search?q=${q}&type=album&market=TW&limit=5`,
      {
        headers: { 'Authorization': `Bearer ${token}` },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!resp.ok) return null;
    const data = await resp.json();
    const items: Array<{ images: Array<{ url: string }>; artists: Array<{ name: string }> }>
      = data?.albums?.items ?? [];
    if (!items.length) return null;
    const matched = items.find(item => isMayday(item.artists.map(a => a.name)));
    const pick = matched ?? items[0];
    if (!pick?.images?.length) return null;
    return pick.images[0].url;
  } catch {
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
    const data = await Promise.any(
      proxies.map(url =>
        fetch(url, { signal: AbortSignal.timeout(8000) }).then(r => {
          if (!r.ok) throw new Error(String(r.status));
          return r.json();
        })
      )
    );
    const albums: Array<{ picUrl?: string; publishTime?: number; artists?: Array<{ name: string }> }>
      = data?.result?.albums ?? [];
    if (!albums.length) return null;

    const pool = albums.filter(a => isMayday((a.artists ?? []).map(x => x.name)));
    const candidates = pool.length ? pool : albums;
    const best = candidates.sort((a, b) => {
      const ya = Math.abs((a.publishTime ? new Date(a.publishTime).getFullYear() : 0) - year);
      const yb = Math.abs((b.publishTime ? new Date(b.publishTime).getFullYear() : 0) - year);
      return ya - yb;
    })[0];

    return best.picUrl ? best.picUrl + '?param=600y600' : null;
  } catch {
    return null;
  }
}

// Source 2: iTunes Search API (fallback)
async function fetchArtFromItunes(albumName: string, year: number): Promise<string | null> {
  const queries = [`五月天 ${albumName}`, `Mayday ${albumName}`, '五月天'];
  for (const q of queries) {
    try {
      const resp = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=album&limit=8&media=music&country=tw`,
        { signal: AbortSignal.timeout(8000) }
      );
      const data = await resp.json();
      if (!data.results?.length) continue;
      const all = data.results as Array<{ artworkUrl100: string; releaseDate?: string; artistName?: string }>;
      const pool = all.filter(r => isMayday([r.artistName ?? '']));
      const candidates = pool.length ? pool : all;
      const best = candidates.sort((a, b) => {
        const ya = Math.abs(parseInt(a.releaseDate ?? '0') - year);
        const yb = Math.abs(parseInt(b.releaseDate ?? '0') - year);
        return ya - yb;
      })[0];
      return best.artworkUrl100.replace('100x100bb', '600x600bb');
    } catch { /* try next query */ }
  }
  return null;
}

async function fetchArtForAlbum(albumName: string, year: number): Promise<string | null> {
  return (
    (await fetchArtFromSpotify(albumName)) ??
    (await fetchArtFromNetease(albumName, year)) ??
    (await fetchArtFromItunes(albumName, year))
  );
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
