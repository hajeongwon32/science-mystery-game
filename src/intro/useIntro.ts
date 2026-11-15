import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { AudioScene } from './audio';
import { preloadAssets } from './assets';
import { beats, getBeatIndex } from './content';
import { currentLine, initialState, introReducer } from './state';

function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return reduced;
}

export function useIntro() {
  const [state, dispatch] = useReducer(introReducer, initialState);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.35);
  const [ready, setReady] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');
  const audio = useRef<AudioScene | null>(null);
  const mounted = useRef(false);
  const startingRef = useRef(false);
  const lastCue = useRef('');
  const reducedMotion = useReducedMotion();
  const beatIndex = getBeatIndex(state.elapsed);
  const line = currentLine(state);
  const complete = reducedMotion || state.revealed >= line.length;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      const engine = audio.current;
      audio.current = null;
      void engine?.dispose().catch(() => undefined);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    void preloadAssets()
      .then(() => {
        if (!cancelled) setReady(true);
      })
      .catch(() => {
        if (!cancelled) setError('이미지를 불러오지 못했습니다. 새로고침해 주세요.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Only a user gesture creates/resumes the AudioContext for the first time.
  const start = useCallback(async () => {
    if (!ready || startingRef.current) return;
    startingRef.current = true;
    setStarting(true);
    setError('');
    try {
      try {
        if (!audio.current) audio.current = new AudioScene();
        audio.current.mix(muted, volume);
        await audio.current.resume();
        audio.current.stop();
        audio.current.start();
      } catch {
        const engine = audio.current;
        audio.current = null;
        void engine?.dispose().catch(() => undefined);
        if (mounted.current) {
          setMuted(true);
          setError('소리를 재생할 수 없어 자막으로 진행합니다.');
        }
      }
      if (mounted.current) dispatch({ type: 'start' });
    } finally {
      startingRef.current = false;
      if (mounted.current) setStarting(false);
    }
  }, [ready, muted, volume]);

  useEffect(() => {
    audio.current?.mix(muted, volume);
  }, [muted, volume]);
  useEffect(() => {
    audio.current?.cancelCues();
  }, [state.mode, state.run]);
  useEffect(() => {
    const engine = audio.current;
    if (!engine) return;
    if (state.mode === 'idle') {
      engine.stop();
      void engine.suspend().catch(() => undefined);
    } else if (state.paused) {
      void engine.suspend().catch(() => undefined);
    } else {
      engine.start();
      void engine.resume().catch(() => undefined);
    }
  }, [state.mode, state.paused, state.run]);

  // Effects are keyed by narrative transitions, not by every typed character.
  // The ref also prevents duplicate cues in development StrictMode.
  useEffect(() => {
    const key = `${state.run}:${state.mode}:${beatIndex}:${state.suspectIndex}:${state.lineIndex}`;
    if (lastCue.current === key) return;
    lastCue.current = key;
    if (state.mode === 'intro') {
      const cue = beats[beatIndex].cue;
      if (cue) audio.current?.cue(cue);
    } else if (state.mode === 'suspect') audio.current?.cue('page');
    else if (state.mode === 'end') audio.current?.cue('title');
  }, [state.run, state.mode, beatIndex, state.suspectIndex, state.lineIndex]);

  useEffect(() => {
    if (state.mode !== 'intro' || state.paused) return;
    let last = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      dispatch({ type: 'tick', seconds: (now - last) / 1000 });
      last = now;
    }, 100);
    return () => clearInterval(timer);
  }, [state.mode, state.paused, state.run]);

  useEffect(() => {
    if (state.mode !== 'suspect' || state.paused || complete) return;
    const timer = window.setInterval(() => dispatch({ type: 'type' }), 38);
    return () => clearInterval(timer);
  }, [state.mode, state.paused, state.suspectIndex, state.lineIndex, state.run, complete]);

  const next = useCallback(
    () => dispatch({ type: 'next', instant: reducedMotion }),
    [reducedMotion],
  );
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
      if (
        event.target instanceof HTMLElement &&
        event.target.closest('button,a,input,select,textarea')
      )
        return;
      if (event.code !== 'Space' && event.code !== 'Enter') return;
      event.preventDefault();
      if (state.mode === 'idle') void start();
      else if (state.mode === 'suspect') next();
      else if (state.mode === 'intro') dispatch({ type: 'toggle-pause' });
    };
    document.addEventListener('keydown', keydown);
    return () => document.removeEventListener('keydown', keydown);
  }, [state.mode, start, next]);

  useEffect(() => {
    const visibility = () => {
      if (document.hidden) dispatch({ type: 'pause' });
    };
    const pagehide = () => {
      audio.current?.stop();
      void audio.current?.suspend().catch(() => undefined);
      dispatch({ type: 'pause' });
    };
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('pagehide', pagehide);
    return () => {
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('pagehide', pagehide);
    };
  }, []);

  return {
    state,
    dispatch,
    beat: beats[beatIndex],
    beatIndex,
    reducedMotion,
    text: reducedMotion ? line : line.slice(0, state.revealed),
    muted,
    volume,
    setMuted,
    setVolume,
    ready,
    starting,
    error,
    setError,
    start,
    next,
  };
}

export type IntroController = ReturnType<typeof useIntro>;
