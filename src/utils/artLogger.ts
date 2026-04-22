export interface ArtLogEntry {
  ts: string;
  album: string;
  source: 'Spotify' | 'NetEase' | 'iTunes' | 'FINAL';
  status: 'ok' | 'fail';
  detail: string;
}

const entries: ArtLogEntry[] = [];

export function logArt(entry: Omit<ArtLogEntry, 'ts'>): void {
  entries.push({ ts: new Date().toISOString().slice(11, 23), ...entry });
}

export function getArtLog(): ArtLogEntry[] {
  return entries;
}

export function getArtLogText(): string {
  if (!entries.length) return '(no log entries)';
  return entries
    .map(e => `[${e.ts}] [${e.source}] [${e.status}] ${e.album} — ${e.detail}`)
    .join('\n');
}

// Expose on window for quick console access: copy(window.__artLog())
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).__artLog = getArtLogText;
}
