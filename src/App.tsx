import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameState } from './hooks/useGameState';
import { useAlbumArt } from './hooks/useAlbumArt';
import { useAudioPreload } from './hooks/useAudioPreload';
import { fetchSongAudio } from './hooks/useAudioPreload';
import IntroScreen from './screens/IntroScreen';
import LoadingScreen from './screens/LoadingScreen';
import GameScreen from './screens/GameScreen';
import ResultScreen from './screens/ResultScreen';

// Shared fade variants used by every screen wrapper.
const screenVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit:    { opacity: 0 },
};

const screenTransition = { duration: 0.35, ease: 'easeInOut' as const };

export default function App() {
  const { state, startGame, pick, setPhase, setWinnerAudio, restart } =
    useGameState();
  const { songs, done: artDone } = useAlbumArt(true);
  const { play, pause } = useAudioPreload();

  // Keep a ref to the enriched songs so GameScreen / ResultScreen always get
  // the latest coverUrl / dominantColor without causing unnecessary re-renders.
  const songsRef = useRef(songs);
  songsRef.current = songs;

  // When phase transitions to 'transitioning', kick off audio fetch then move
  // to 'loading'. When audio resolves, move to 'result'.
  const audioFetchedRef = useRef(false);
  useEffect(() => {
    if (state.phase !== 'transitioning') return;
    if (audioFetchedRef.current) return;
    if (!state.winner) return;

    audioFetchedRef.current = true;

    const winner = state.winner;

    // Move to loading immediately
    setPhase('loading');

    const audioPromise = fetchSongAudio(winner);
    const timeout = new Promise<null>((res) => setTimeout(() => res(null), 8000));

    Promise.race([audioPromise, timeout]).then((audioUrl) => {
      setWinnerAudio(typeof audioUrl === 'string' ? audioUrl : null);
      setPhase('result');
      audioFetchedRef.current = false;
    });
  }, [state.phase, state.winner, setPhase, setWinnerAudio]);

  // Merge runtime coverUrl / dominantColor from useAlbumArt into the game state
  // songs. The state songs are fixed references from the reducer; we need to
  // look up the enriched version from useAlbumArt by id.
  function enrich<T extends { id: number } | null>(song: T): T {
    if (!song) return song;
    const enriched = songsRef.current.find((s) => s.id === (song as { id: number }).id);
    return enriched ? { ...song, ...enriched } : song;
  }

  const enrichedLeft = enrich(state.left);
  const enrichedRight = enrich(state.right);
  const enrichedWinner = enrich(state.winner);

  // Handle restart: pause audio + reset state
  function handleRestart() {
    pause();
    restart();
  }

  return (
    <AnimatePresence mode="wait">
      {state.phase === 'intro' && (
        <motion.div
          key="intro"
          variants={screenVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={screenTransition}
          style={{ display: 'contents' }}
        >
          <IntroScreen onStart={startGame} ready={artDone} />
        </motion.div>
      )}

      {state.phase === 'loading' && enrichedWinner && (
        // LoadingScreen is purely decorative here — the audio fetch in the
        // useEffect above drives the transition to 'result'.
        <motion.div
          key="loading"
          variants={screenVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={screenTransition}
          style={{ display: 'contents' }}
        >
          <LoadingScreen song={enrichedWinner} />
        </motion.div>
      )}

      {state.phase === 'playing' && enrichedLeft && enrichedRight && (
        <motion.div
          key="playing"
          variants={screenVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={screenTransition}
          style={{ display: 'contents' }}
        >
          <GameScreen
            left={enrichedLeft}
            right={enrichedRight}
            round={state.round}
            onPick={pick}
          />
        </motion.div>
      )}

      {state.phase === 'result' && enrichedWinner && (
        <motion.div
          key="result"
          variants={screenVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={screenTransition}
          style={{ display: 'contents' }}
        >
          <ResultScreen
            winner={enrichedWinner}
            wins={state.winnerWins}
            history={state.history}
            audioUrl={state.preloadedAudioUrl}
            onRestart={handleRestart}
            playAudio={play}
            pauseAudio={pause}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
