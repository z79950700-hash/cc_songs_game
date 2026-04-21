import { useReducer, useCallback } from 'react';
import { SONGS } from '../data/songs';
import type { Song } from '../data/songs';
import type { GameState, HistoryEntry, Phase } from '../types/game';
import { createInitialState } from '../types/game';

// ===== UTILITIES =====

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ===== ACTION TYPES =====

export type GameAction =
  | { type: 'START_GAME' }
  | { type: 'PICK'; side: 'left' | 'right' }
  | { type: 'SET_PHASE'; phase: Phase }
  | { type: 'SET_WINNER_AUDIO'; audioUrl: string | null }
  | { type: 'RESTART' };

// Extend GameState to carry the preloaded audio URL so the result screen can
// pick it up without an extra context layer.
export interface ExtendedGameState extends GameState {
  preloadedAudioUrl: string | null;
}

// ===== REDUCER =====

function gameReducer(
  state: ExtendedGameState,
  action: GameAction
): ExtendedGameState {
  switch (action.type) {
    case 'START_GAME': {
      const shuffled = shuffle(SONGS);
      return {
        ...state,
        phase: 'playing',
        round: 0,
        wins: {},
        history: [],
        winner: null,
        winnerWins: 0,
        preloadedAudioUrl: null,
        left: shuffled[0],
        right: shuffled[1],
        pool: shuffled.slice(2),
      };
    }

    case 'PICK': {
      // Guard: only act when in the playing phase
      if (state.phase !== 'playing') return state;

      const { side } = action;
      const winner = state[side] as Song;
      const loser = state[side === 'left' ? 'right' : 'left'] as Song;

      const newWins = {
        ...state.wins,
        [winner.id]: (state.wins[winner.id] ?? 0) + 1,
      };

      const newRound = state.round + 1;

      const entry: HistoryEntry = {
        round: newRound,
        left: state.left as Song,
        right: state.right as Song,
        winner,
        loser,
      };
      const newHistory = [...state.history, entry];

      if (newRound >= 15) {
        // Final round — move immediately to 'transitioning'; the component is
        // responsible for kicking off audio fetch and then dispatching
        // SET_PHASE('loading') / SET_PHASE('result') after the fetch settles.
        return {
          ...state,
          phase: 'transitioning',
          round: newRound,
          wins: newWins,
          history: newHistory,
          winner,
          winnerWins: newWins[winner.id] ?? 1,
        };
      }

      // Not the final round — replace the loser with the next song from the pool
      let newPool = [...state.pool];
      const replacement = newPool.pop() as Song;

      // Replenish pool when it runs dry
      if (newPool.length === 0) {
        const usedIds = new Set<number>([
          winner.id,
          replacement?.id,
        ]);
        newHistory.forEach((h) => {
          usedIds.add(h.winner.id);
          usedIds.add(h.loser.id);
        });
        newPool = shuffle(SONGS.filter((s) => !usedIds.has(s.id)));
        if (newPool.length === 0) {
          newPool = shuffle(
            SONGS.filter(
              (s) => s.id !== winner.id && s.id !== replacement?.id
            )
          );
        }
      }

      const newLeft =
        side === 'left' ? winner : replacement;
      const newRight =
        side === 'right' ? winner : replacement;

      return {
        ...state,
        phase: 'playing',
        round: newRound,
        wins: newWins,
        history: newHistory,
        pool: newPool,
        left: newLeft,
        right: newRight,
      };
    }

    case 'SET_PHASE': {
      return { ...state, phase: action.phase };
    }

    case 'SET_WINNER_AUDIO': {
      return { ...state, preloadedAudioUrl: action.audioUrl };
    }

    case 'RESTART': {
      return {
        ...createInitialState(),
        preloadedAudioUrl: null,
      };
    }

    default:
      return state;
  }
}

// ===== HOOK =====

const initialExtendedState: ExtendedGameState = {
  ...createInitialState(),
  preloadedAudioUrl: null,
};

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, initialExtendedState);

  const startGame = useCallback(() => dispatch({ type: 'START_GAME' }), []);

  const pick = useCallback(
    (side: 'left' | 'right') => dispatch({ type: 'PICK', side }),
    []
  );

  const setPhase = useCallback(
    (phase: Phase) => dispatch({ type: 'SET_PHASE', phase }),
    []
  );

  const setWinnerAudio = useCallback(
    (audioUrl: string | null) =>
      dispatch({ type: 'SET_WINNER_AUDIO', audioUrl }),
    []
  );

  const restart = useCallback(() => dispatch({ type: 'RESTART' }), []);

  return { state, startGame, pick, setPhase, setWinnerAudio, restart };
}
