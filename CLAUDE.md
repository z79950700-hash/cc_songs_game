# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the app

No build step. Open `index.html` directly in a browser, or serve it with any static file server:

```bash
python -m http.server 8080
```

## Architecture

The entire app lives in a single file: `index.html` (~1900 lines). It has no dependencies, no framework, and no bundler.

**Mount point:** A single `<div id="app">` is the root. JavaScript clears and re-renders it on every screen transition.

**Four screens rendered by JS:**
- `renderIntro()` — landing screen with animated mascot and particles
- `renderLoading()` — shown while iTunes album art is being fetched
- `renderGame()` — the binary song-choice duel (15 rounds)
- `renderResult()` — winner reveal with stats, timeline, and same-album recommendations

**Data layer:**
- `SONGS` — array of 30 song objects (`id`, `title`, `album`, `year`, `color`, `coverUrl`, `lyricsExcerpt`, `backgroundStory`). `coverUrl` starts empty and is populated at runtime by `prefetchAlbumArt()`.
- `AWARDS` — sparse object keyed by song `id` with award strings.
- `state` — mutable game state: `{ pool, history, wins, winner, winnerWins }`.

**Album art pipeline:**
1. `prefetchAlbumArt()` queries the iTunes Search API (`/search?entity=album&country=tw`) for each unique album, falling back through three query strings.
2. The resolved artwork URL is stored on each matching song as `coverUrl`.
3. `extractDominantColor()` samples the image via canvas (CORS-safe through the weserv.nl proxy) and stores the result as `dominantColor` on each song.
4. All backgrounds and card gradients prefer `dominantColor` over the static `color` field.

**Image proxy:** `proxyUrl(url)` rewrites all cover art through `images.weserv.nl` to bypass CORS when the page is opened from `file://`.

## patch.py

`patch.py` is a one-off maintenance script, not part of the runtime. It applies targeted find-and-replace patches to `index.html` using exact string matching. Run it only when replaying a known set of structural changes:

```bash
python patch.py
```

Each patch prints `OK` or `FAIL`. A `FAIL` means the target string was not found (likely already applied or the file has diverged).
