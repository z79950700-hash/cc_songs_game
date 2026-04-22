# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the app

```bash
npm run dev      # 开发服务器 localhost:5173
npm run build    # 生产构建，输出到 dist/
```

部署：推送到 GitHub `master` 分支，Vercel 自动构建部署。每次推送同时同步 `main`：
```bash
git push && git push origin master:main --force
```

## 版本号（调试用）

`vite.config.ts` 在构建时自动注入 `__BUILD_TIME__`（ISO 时间戳），首屏右上角显示构建时间。

**每次修改代码后必须重新构建**（`npm run build` 或推送触发 Vercel 构建），版本号自动更新，无需手动修改任何文件。

## 架构

Vite + React 18 + TypeScript，入口 `src/main.tsx`，挂载到 `index.html` 的 `<div id="root">`。

**屏幕流转（由 `useGameState` 的 `phase` 驱动）：**
```
intro → playing → transitioning → loading → result
```

**组件树：**
```
App.tsx                          ← phase 路由 + AnimatePresence 屏幕切换
├── IntroScreen                  ← 粒子 + 吉祥物 SVG + 开始按钮
├── LoadingScreen                ← 等待音频加载
├── GameScreen → SongCard        ← 15 轮对决，左右分屏
└── ResultScreen                 ← 结果 + 7 个子组件
    ├── ResultHeader / ResultLyrics / ResultStory
    ├── ResultStats / ResultAwards
    └── ResultTimeline / ResultSameAlbum / ResultRestart
```

**数据层：**
- `src/data/songs.ts` — `SONGS`（50首）+ `AWARDS`（6条）+ `Song` 接口
- `src/types/game.ts` — `Phase` / `GameState` / `HistoryEntry`

**Hooks：**
- `useGameState` — `useReducer` 管理游戏状态，actions: START_GAME / PICK / SET_PHASE / SET_WINNER_AUDIO / RESTART
- `useAlbumArt` — 专辑封面获取（网易云优先，iTunes 兜底）+ Canvas 主色提取
- `useAudioPreload` — 背景音乐加载（NetEase → iTunes preview 兜底）

**工具函数（`src/utils/color.ts`）：**
- `proxyUrl(url)` — 通过 `images.weserv.nl` 代理图片，解决 CORS
- `adjustColor(hex, amt)` — 颜色明暗调整
- `extractDominantColor(proxyImgUrl)` — Canvas 采样提取主色调，失败降级到 `null`

**专辑封面 pipeline：**
1. `useAlbumArt` 在应用启动时立即开始获取，首屏按钮禁用直到 `done=true`
2. 网易云 API 经 `allorigins.win` 代理请求（CORS），iTunes 直接请求
3. 封面 URL 存入 `song.coverUrl`，经 `proxyUrl()` 包装后用于 `<img>` 和 Canvas
4. Canvas 提取 `dominantColor` 存入 `song.dominantColor`，用于背景渐变

**音频 pipeline：**
- 第15轮选择后进入 `transitioning` phase，`App.tsx` 发起音频 fetch（8s 超时）
- 网易云搜歌 → allorigins 代理 → 获取播放 URL；失败则用 iTunes 30s 预览
- iOS Safari 阻断自动播放时，结果页顶部显示「▶ 点击播放音乐」按钮

## 原始备份

`index.html.bak` — 迁移前的单文件 Vanilla JS 版本，仅供参考。
