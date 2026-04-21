import type { Song } from '../data/songs';

// ===== GAME PHASE =====

export type Phase =
  | 'intro'
  | 'loading'
  | 'playing'
  | 'transitioning'
  | 'result';

// ===== HISTORY ENTRY =====
// Records what happened in a single round

export interface HistoryEntry {
  round: number;
  left: Song;
  right: Song;
  winner: Song;
  loser: Song;
}

// ===== GLOBAL GAME STATE =====

export interface GameState {
  phase: Phase;
  round: number;
  /** Songs still waiting to be matched */
  pool: Song[];
  /** Current left-side contender (null before game starts) */
  left: Song | null;
  /** Current right-side contender (null before game starts) */
  right: Song | null;
  /** Accumulated win counts keyed by song id */
  wins: Record<number, number>;
  /** Full round-by-round history */
  history: HistoryEntry[];
  /** Final winner song (null until result phase) */
  winner: Song | null;
  /** How many rounds the winner won */
  winnerWins: number;
}

// ===== INITIAL STATE FACTORY =====

export function createInitialState(): GameState {
  return {
    phase: 'intro',
    round: 0,
    pool: [],
    left: null,
    right: null,
    wins: {},
    history: [],
    winner: null,
    winnerWins: 0,
  };
}
