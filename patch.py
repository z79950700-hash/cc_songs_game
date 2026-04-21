with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# ── 1. Replace utility functions block ──────────────────────────────────────
OLD_UTILS = """function proxyUrl(url) {
  // Strip protocol for weserv.nl proxy (bypasses CORS from file://)
  return 'https://images.weserv.nl/?url=' + url.replace(/^https?:\\/\\//, '') + '&w=400&h=400&fit=cover';
}

function adjustColor(hex, amt) {
  const clamp = v => Math.max(0, Math.min(255, v));
  const r = clamp(parseInt(hex.slice(1,3), 16) + amt);
  const g = clamp(parseInt(hex.slice(3,5), 16) + amt);
  const b = clamp(parseInt(hex.slice(5,7), 16) + amt);
  return `rgb(${r},${g},${b})`;
}

function setSongBackground(el, song) {
  const fallback = `radial-gradient(ellipse at 60% 40%, ${song.color}dd 0%, ${song.color}44 50%, #000 100%)`;
  el.style.backgroundImage = fallback;
  if (!song.coverUrl) return;
  const img = new Image();
  img.onload = () => { el.style.backgroundImage = `url(${song.coverUrl})`; };
  img.src = song.coverUrl;
}"""

NEW_UTILS = """function proxyUrl(url) {
  if (!url) return '';
  return 'https://images.weserv.nl/?url=' + url.replace(/^https?:\\/\\//, '') + '&w=600&h=600&fit=cover&we';
}

function adjustColor(hex, amt) {
  if (!hex || hex[0] !== '#') return hex || '#333';
  const clamp = v => Math.max(0, Math.min(255, v));
  const r = clamp(parseInt(hex.slice(1,3), 16) + amt);
  const g = clamp(parseInt(hex.slice(3,5), 16) + amt);
  const b = clamp(parseInt(hex.slice(5,7), 16) + amt);
  return `rgb(${r},${g},${b})`;
}

// Extract dominant (saturated, mid-brightness) color from image via canvas
function extractDominantColor(proxyImgUrl) {
  return new Promise(resolve => {
    if (!proxyImgUrl) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const c = document.createElement('canvas');
        c.width = c.height = 80;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0, 80, 80);
        const d = ctx.getImageData(0, 0, 80, 80).data;
        let r = 0, g = 0, b = 0, n = 0;
        for (let i = 0; i < d.length; i += 4) {
          const lum = (d[i] + d[i+1] + d[i+2]) / 3;
          const sat = Math.max(d[i], d[i+1], d[i+2]) - Math.min(d[i], d[i+1], d[i+2]);
          if (lum > 25 && lum < 230 && sat > 20) {
            r += d[i]; g += d[i+1]; b += d[i+2]; n++;
          }
        }
        if (n === 0) return resolve(null);
        const toH = v => Math.round(v/n).toString(16).padStart(2,'0');
        resolve('#' + toH(r) + toH(g) + toH(b));
      } catch(e) { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = proxyImgUrl;
  });
}

function setSongBackground(el, song) {
  const base = song.dominantColor || song.color;
  const fallback = `radial-gradient(ellipse at 60% 40%, ${base}dd 0%, ${base}44 50%, #000 100%)`;
  el.style.backgroundImage = fallback;
  const purl = song.coverUrl ? proxyUrl(song.coverUrl) : '';
  if (!purl) return;
  const img = new Image();
  img.onload = () => { el.style.backgroundImage = `url(${purl})`; };
  img.src = purl;
}"""

html = html.replace(OLD_UTILS, NEW_UTILS)
print("Utils:", "OK" if OLD_UTILS not in html else "FAIL")

# ── 2. Replace prefetchAlbumArt ─────────────────────────────────────────────
OLD_PREFETCH = """// ===== PREFETCH ALBUM ART (iTunes Search API) =====
async function prefetchAlbumArt() {
  const seen = new Set();
  const uniqueAlbums = SONGS.filter(s => {
    if (seen.has(s.album)) return false;
    seen.add(s.album); return true;
  });

  await Promise.allSettled(uniqueAlbums.map(async (ref) => {
    try {
      const q = encodeURIComponent('五月天 ' + ref.album);
      const resp = await fetch(
        `https://itunes.apple.com/search?term=${q}&entity=album&limit=5&media=music`,
        { signal: AbortSignal.timeout(10000) }
      );
      const data = await resp.json();
      if (!data.results?.length) return;
      // Pick result closest in year
      const best = data.results.sort((a, b) => {
        const ya = Math.abs(parseInt(a.releaseDate) - ref.year);
        const yb = Math.abs(parseInt(b.releaseDate) - ref.year);
        return ya - yb;
      })[0];
      const art = best.artworkUrl100.replace('100x100bb', '600x600bb');
      SONGS.filter(s => s.album === ref.album).forEach(s => s.coverUrl = art);
    } catch(e) { /* keep gradient fallback */ }
  }));
}"""

NEW_PREFETCH = """// ===== PREFETCH ALBUM ART + DOMINANT COLOR =====
async function prefetchAlbumArt() {
  const seen = new Set();
  const uniqueAlbums = SONGS.filter(s => {
    if (seen.has(s.album)) return false;
    seen.add(s.album); return true;
  });

  await Promise.allSettled(uniqueAlbums.map(async (ref) => {
    try {
      // Try album search first, then artist-only search as fallback
      const queries = [
        `五月天 ${ref.album}`,
        `Mayday ${ref.album}`,
        '五月天'
      ];
      let art = null;
      for (const q of queries) {
        const resp = await fetch(
          `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=album&limit=8&media=music&country=tw`,
          { signal: AbortSignal.timeout(8000) }
        );
        const data = await resp.json();
        if (!data.results?.length) continue;
        const best = data.results.sort((a, b) => {
          const ya = Math.abs(parseInt(a.releaseDate || '0') - ref.year);
          const yb = Math.abs(parseInt(b.releaseDate || '0') - ref.year);
          return ya - yb;
        })[0];
        art = best.artworkUrl100.replace('100x100bb', '600x600bb');
        break;
      }
      if (!art) return;
      const affected = SONGS.filter(s => s.album === ref.album);
      affected.forEach(s => s.coverUrl = art);
      // Extract dominant color via canvas (weserv proxy adds CORS headers)
      const purl = proxyUrl(art);
      const dominant = await extractDominantColor(purl);
      if (dominant) affected.forEach(s => s.dominantColor = dominant);
    } catch(e) { /* keep gradient fallback */ }
  }));
}"""

html = html.replace(OLD_PREFETCH, NEW_PREFETCH)
print("Prefetch:", "OK" if OLD_PREFETCH not in html else "FAIL")

# ── 3. Fix renderGame background ────────────────────────────────────────────
OLD_BG = """  const bgLeft = document.getElementById('bgLeft');
  const bgRight = document.getElementById('bgRight');
  bgLeft.style.background  = `radial-gradient(ellipse at 35% 50%, ${adjustColor(leftSong.color,  55)} 0%, ${leftSong.color}  45%, ${adjustColor(leftSong.color,  -55)} 100%)`;
  bgRight.style.background = `radial-gradient(ellipse at 65% 50%, ${adjustColor(rightSong.color, 55)} 0%, ${rightSong.color} 45%, ${adjustColor(rightSong.color, -55)} 100%)`;
  bgLeft.style.opacity  = '';
  bgRight.style.opacity = '';"""

NEW_BG = """  const bgLeft = document.getElementById('bgLeft');
  const bgRight = document.getElementById('bgRight');
  const lc = leftSong.dominantColor  || leftSong.color;
  const rc = rightSong.dominantColor || rightSong.color;
  bgLeft.style.background  = `radial-gradient(ellipse at 35% 50%, ${adjustColor(lc,  60)} 0%, ${lc}  45%, ${adjustColor(lc,  -60)} 100%)`;
  bgRight.style.background = `radial-gradient(ellipse at 65% 50%, ${adjustColor(rc, 60)} 0%, ${rc} 45%, ${adjustColor(rc, -60)} 100%)`;
  bgLeft.style.opacity  = '';
  bgRight.style.opacity = '';"""

html = html.replace(OLD_BG, NEW_BG)
print("BgColors:", "OK" if OLD_BG not in html else "FAIL")

# ── 4. Fix buildCard img (handle empty coverUrl) ─────────────────────────────
OLD_CARD = """function buildCard(cardEl, song, side) {
  const purl = proxyUrl(song.coverUrl);
  const fallbackStyle = `background:linear-gradient(145deg,${adjustColor(song.color,60)} 0%,${song.color} 55%,${adjustColor(song.color,-50)} 100%)`;

  cardEl.innerHTML = `
    <div class="card-inner">
      <img class="card-album-thumb" src="${purl}" alt="${song.album}"
           onerror="this.removeAttribute('src');this.style.cssText='${fallbackStyle};width:220px;height:220px;border-radius:14px;display:block;margin:0 auto 1.5rem'">
      <div class="card-title">${song.title}</div>
      <div class="card-album">${song.album} · ${song.year}</div>
      <button class="pick-btn" data-side="${side}">选择这首 ♡</button>
    </div>
  `;"""

NEW_CARD = """function buildCard(cardEl, song, side) {
  const purl = song.coverUrl ? proxyUrl(song.coverUrl) : '';
  const base = song.dominantColor || song.color;
  const fallbackStyle = `background:linear-gradient(145deg,${adjustColor(base,60)} 0%,${base} 55%,${adjustColor(base,-50)} 100%)`;
  const imgTag = purl
    ? `<img class="card-album-thumb" src="${purl}" alt="${song.album}" crossorigin="anonymous"
           onerror="this.style.cssText='${fallbackStyle};width:220px;height:220px;border-radius:14px;display:block;margin:0 auto 1.5rem';this.removeAttribute('src')">`
    : `<div class="card-album-thumb" style="${fallbackStyle}"></div>`;

  cardEl.innerHTML = `
    <div class="card-inner">
      ${imgTag}
      <div class="card-title">${song.title}</div>
      <div class="card-album">${song.album} · ${song.year}</div>
      <button class="pick-btn" data-side="${side}">选择这首 ♡</button>
    </div>
  `;"""

html = html.replace(OLD_CARD, NEW_CARD)
print("Card:", "OK" if OLD_CARD not in html else "FAIL")

# ── 5. Add result screen extra CSS (before screen-transition block) ──────────
OLD_STATS_CSS = """/* ===== SCREEN TRANSITION ===== */"""

NEW_STATS_CSS = """/* ===== RESULT STATS ===== */
.result-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  max-width: 480px;
  margin: 0 auto 2rem;
}
.stat-cell {
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  padding: 0.9rem 0.5rem;
  text-align: center;
}
.stat-value {
  font-size: 1.6rem;
  font-weight: 900;
  color: var(--winner-color, #e94560);
  line-height: 1;
}
.stat-label {
  font-size: 0.68rem;
  color: rgba(255,255,255,0.35);
  letter-spacing: 0.08em;
  margin-top: 0.3rem;
}
.same-album-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}
.same-album-chip {
  padding: 0.35rem 0.9rem;
  border-radius: 50px;
  border: 1px solid rgba(255,255,255,0.15);
  font-size: 0.8rem;
  color: rgba(255,255,255,0.6);
  background: rgba(255,255,255,0.05);
}

/* ===== SCREEN TRANSITION ===== */"""

html = html.replace(OLD_STATS_CSS, NEW_STATS_CSS)
print("StatCSS:", "OK" if OLD_STATS_CSS not in html else "FAIL")

# ── 6. Rewrite renderResult ──────────────────────────────────────────────────
OLD_RESULT = """// ===== RENDER RESULT =====
function renderResult() {
  const app = document.getElementById('app');
  app.innerHTML = '';

  const song = state.winner;
  const wins = state.winnerWins;

  // Find runner-up
  const sorted = Object.entries(state.wins)
    .sort((a, b) => b[1] - a[1]);
  const runnerUpEntry = sorted.find(([id]) => parseInt(id) !== song.id);
  const runnerUp = runnerUpEntry ? SONGS.find(s => s.id === parseInt(runnerUpEntry[0])) : null;
  const runnerUpWins = runnerUpEntry ? runnerUpEntry[1] : 0;

  // Rounds where winner won
  const winnerRounds = state.history.filter(h => h.winner.id === song.id);
  const defeatedSongs = winnerRounds.map(h => h.loser);

  const screen = document.createElement('div');
  screen.className = 'result-screen screen-fade-enter';
  screen.style.setProperty('--winner-color', song.color);

  screen.innerHTML = `
    <div class="result-bg" id="resultBg"></div>
    <div class="result-bg-overlay"></div>

    <!-- ① 主标题区 -->
    <div class="result-content">
      <div class="result-eyebrow">15 轮对决后</div>
      <div class="result-label">你最爱的五月天歌曲是</div>
      <div class="result-title">${song.title}</div>
      <div class="result-album">${song.album} &nbsp;·&nbsp; ${song.year}</div>
      <div class="result-divider"></div>
      <div class="result-lyrics">
        <div class="result-lyrics-text" id="lyricsText"></div>
      </div>
      <div class="result-story" id="storyText">${song.backgroundStory}</div>
      <div class="result-wins">在游戏中赢得了 <span>${wins}</span> 次对决</div>
    </div>

    <div class="scroll-hint">↓ &nbsp;继续向下探索&nbsp; ↓</div>

    <!-- ② 本局战绩 -->
    <div class="result-section-divider"></div>
    <div class="result-section">
      <div class="result-section-title">本局对决战绩</div>
      <div class="battle-timeline" id="battleTimeline"></div>
    </div>

    <!-- ③ 亚军 -->
    ${runnerUp ? `
    <div class="result-section-divider"></div>
    <div class="result-section">
      <div class="result-section-title">险输的亚军</div>
      <div class="runner-up-card">
        <div class="runner-up-color" style="background:${runnerUp.color}"></div>
        <div>
          <div class="runner-up-title">${runnerUp.title}</div>
          <div class="runner-up-meta">${runnerUp.album} · ${runnerUp.year} &nbsp;·&nbsp; 赢得 ${runnerUpWins} 次</div>
          <div class="runner-up-meta" style="margin-top:.4rem;color:rgba(255,255,255,.4);font-style:italic">${runnerUp.backgroundStory.slice(0, 60)}…</div>
        </div>
      </div>
    </div>` : ''}

    <!-- ④ 被击败的歌曲 -->
    ${defeatedSongs.length ? `
    <div class="result-section-divider"></div>
    <div class="result-section">
      <div class="result-section-title">被你击败的歌曲</div>
      <div class="defeated-chips">
        ${defeatedSongs.map(s => `<span class="defeated-chip">${s.title}</span>`).join('')}
      </div>
    </div>` : ''}

    <!-- ⑤ 专辑背景 -->
    <div class="result-section-divider"></div>
    <div class="result-section" style="text-align:left">
      <div class="result-section-title" style="text-align:center">关于这张专辑</div>
      <div style="font-family:var(--font-serif);font-size:.9rem;color:rgba(255,255,255,.5);line-height:1.9">
        《${song.album}》于 ${song.year} 年发行，是五月天音乐历程中的重要节点。
        这张专辑见证了乐队创作风格的演变，也留下了许多陪伴一代人成长的旋律。
        <em style="color:rgba(255,255,255,.3)">「${song.title}」</em>是其中辨识度最高的作品之一，在演唱会和流媒体平台上长期占据高位。
      </div>
    </div>

    <!-- ⑥ 再来一次 -->
    <div class="result-section-divider"></div>
    <div class="result-section" style="text-align:center;padding-bottom:1rem">
      <button class="result-btn" id="restartBtn">再玩一次</button>
    </div>
  `;

  app.appendChild(screen);

  // Background
  setSongBackground(document.getElementById('resultBg'), song);

  // Typewriter
  setTimeout(() => {
    typewriterReveal(document.getElementById('lyricsText'), song.lyricsExcerpt, 0);
  }, 600);

  // Fade in story
  setTimeout(() => {
    const el = document.getElementById('storyText');
    if (el) el.classList.add('visible');
  }, 2800);

  // Render battle timeline
  const timeline = document.getElementById('battleTimeline');
  if (timeline) {
    state.history.forEach((h, i) => {
      const row = document.createElement('div');
      row.className = 'battle-round';
      row.innerHTML = `
        <span class="battle-round-num">R${i + 1}</span>
        <span class="${h.winner.id === song.id ? 'battle-winner-name' : ''}">${h.winner.title}</span>
        <span class="battle-vs">击败</span>
        <span style="color:rgba(255,255,255,.3)">${h.loser.title}</span>
      `;
      timeline.appendChild(row);
    });
  }

  document.getElementById('restartBtn').addEventListener('click', renderIntro);
}"""

NEW_RESULT = """// ===== RENDER RESULT =====
function renderResult() {
  const app = document.getElementById('app');
  app.innerHTML = '';

  const song = state.winner;
  const wins = state.winnerWins;
  const totalYears = new Date().getFullYear() - song.year;

  // Defeated songs (rounds where winner won)
  const defeatedSongs = state.history
    .filter(h => h.winner.id === song.id)
    .map(h => h.loser);

  // First win round
  const firstWinRound = state.history.findIndex(h => h.winner.id === song.id) + 1;

  // Same album songs (excluding winner)
  const sameAlbum = SONGS.filter(s => s.album === song.album && s.id !== song.id).slice(0, 5);

  const screen = document.createElement('div');
  screen.className = 'result-screen screen-fade-enter';
  screen.style.setProperty('--winner-color', song.dominantColor || song.color);

  screen.innerHTML = `
    <div class="result-bg" id="resultBg"></div>
    <div class="result-bg-overlay"></div>

    <!-- ① 主标题 -->
    <div class="result-content">
      <div class="result-eyebrow">15 轮直觉对决</div>
      <div class="result-label">你最爱的五月天歌曲是</div>
      <div class="result-title">${song.title}</div>
      <div class="result-album">${song.album} &nbsp;·&nbsp; ${song.year}</div>
      <div class="result-divider"></div>

      <!-- 歌词 -->
      <div class="result-lyrics">
        <div class="result-lyrics-text" id="lyricsText"></div>
      </div>

      <!-- 创作背景 -->
      <div class="result-story" id="storyText">${song.backgroundStory}</div>
    </div>

    <div class="scroll-hint">↓ 向下滑动 ↓</div>

    <!-- ② 数据面板 -->
    <div class="result-section-divider"></div>
    <div class="result-section">
      <div class="result-section-title">这首歌与你</div>
      <div class="result-stats-grid">
        <div class="stat-cell">
          <div class="stat-value">${wins}</div>
          <div class="stat-label">轮对决胜出</div>
        </div>
        <div class="stat-cell">
          <div class="stat-value">第 ${firstWinRound}</div>
          <div class="stat-label">轮首次选择</div>
        </div>
        <div class="stat-cell">
          <div class="stat-value">${totalYears}</div>
          <div class="stat-label">年前发行</div>
        </div>
      </div>
    </div>

    <!-- ③ 关于这首歌 -->
    <div class="result-section-divider"></div>
    <div class="result-section" style="text-align:left">
      <div class="result-section-title" style="text-align:center">为什么是这首</div>
      <div style="font-family:var(--font-serif);font-size:.9rem;color:rgba(255,255,255,.55);line-height:2">
        <p style="margin-bottom:1rem">
          在所有五月天的歌曲里，你的直觉选择了《<em style="color:rgba(255,255,255,.8)">${song.title}</em>》。
          它发行于 ${song.year} 年，收录在专辑《${song.album}》中，距今已陪伴歌迷走过 ${totalYears} 年。
        </p>
        <p style="margin-bottom:1rem">
          ${song.backgroundStory}
        </p>
        <p style="color:rgba(255,255,255,.35);font-style:italic;font-size:.82rem">
          「直觉是最诚实的答案。在 15 次选择里，你总是回到这里。」
        </p>
      </div>
    </div>

    <!-- ④ 你击败了谁 -->
    ${defeatedSongs.length ? `
    <div class="result-section-divider"></div>
    <div class="result-section">
      <div class="result-section-title">一路击败的对手</div>
      <div class="defeated-chips">
        ${defeatedSongs.map(s => `<span class="defeated-chip">${s.title}</span>`).join('')}
      </div>
    </div>` : ''}

    <!-- ⑤ 同专辑推荐 -->
    ${sameAlbum.length ? `
    <div class="result-section-divider"></div>
    <div class="result-section">
      <div class="result-section-title">同专辑 · 你可能也爱</div>
      <div class="same-album-chips">
        ${sameAlbum.map(s => `<span class="same-album-chip">${s.title}</span>`).join('')}
      </div>
    </div>` : ''}

    <!-- ⑥ 对决回顾 -->
    <div class="result-section-divider"></div>
    <div class="result-section">
      <div class="result-section-title">15 轮对决回顾</div>
      <div class="battle-timeline" id="battleTimeline"></div>
    </div>

    <!-- ⑦ 再来一次 -->
    <div class="result-section-divider"></div>
    <div class="result-section" style="text-align:center;padding-bottom:2rem">
      <div style="font-family:var(--font-serif);font-size:.85rem;color:rgba(255,255,255,.3);margin-bottom:1.5rem">
        每一次游戏，答案都可能不同——那才是真实的你
      </div>
      <button class="result-btn" id="restartBtn">再玩一次</button>
    </div>
  `;

  app.appendChild(screen);

  setSongBackground(document.getElementById('resultBg'), song);

  setTimeout(() => {
    typewriterReveal(document.getElementById('lyricsText'), song.lyricsExcerpt, 0);
  }, 600);

  setTimeout(() => {
    const el = document.getElementById('storyText');
    if (el) el.classList.add('visible');
  }, 2200);

  // Battle timeline
  const timeline = document.getElementById('battleTimeline');
  if (timeline) {
    state.history.forEach((h, i) => {
      const isWin = h.winner.id === song.id;
      const row = document.createElement('div');
      row.className = 'battle-round';
      row.innerHTML = `
        <span class="battle-round-num">R${i+1}</span>
        <span class="${isWin ? 'battle-winner-name' : ''}" style="${!isWin ? 'color:rgba(255,255,255,.3)' : ''}">${h.winner.title}</span>
        <span class="battle-vs">›</span>
        <span style="color:rgba(255,255,255,.25);text-decoration:line-through">${h.loser.title}</span>
      `;
      timeline.appendChild(row);
    });
  }

  document.getElementById('restartBtn').addEventListener('click', renderIntro);
}"""

html = html.replace(OLD_RESULT, NEW_RESULT)
print("Result:", "OK" if OLD_RESULT not in html else "FAIL")

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("Done.")
