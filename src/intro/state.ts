import { INTRO_DURATION, suspects } from './content.ts';

export interface IntroState {
  mode: 'idle' | 'intro' | 'suspect' | 'end';
  elapsed: number;
  paused: boolean;
  suspectIndex: number;
  lineIndex: number;
  revealed: number;
  review: boolean;
  run: number;
}
export const initialState: IntroState = {
  mode: 'idle',
  elapsed: 0,
  paused: false,
  suspectIndex: 0,
  lineIndex: 0,
  revealed: 0,
  review: false,
  run: 0,
};
export type IntroAction =
  | { type: 'start' }
  | { type: 'tick'; seconds: number }
  | { type: 'skip' }
  | { type: 'type' }
  | { type: 'next'; instant: boolean }
  | { type: 'toggle-pause' }
  | { type: 'pause' }
  | { type: 'home' }
  | { type: 'review'; index: number };

export function currentLine(state: IntroState): string {
  return suspects[state.suspectIndex].lines[state.lineIndex];
}

export function introReducer(state: IntroState, action: IntroAction): IntroState {
  switch (action.type) {
    case 'start':
      return { ...initialState, mode: 'intro', run: state.run + 1 };
    case 'home':
      return { ...initialState, run: state.run + 1 };
    case 'tick': {
      if (
        state.mode !== 'intro' ||
        state.paused ||
        !Number.isFinite(action.seconds) ||
        action.seconds <= 0
      )
        return state;
      const elapsed = Math.min(INTRO_DURATION, state.elapsed + action.seconds);
      return elapsed >= INTRO_DURATION
        ? { ...state, mode: 'suspect', elapsed, suspectIndex: 0, lineIndex: 0, revealed: 0 }
        : { ...state, elapsed };
    }
    case 'skip':
      return state.mode === 'intro'
        ? {
            ...state,
            mode: 'suspect',
            elapsed: INTRO_DURATION,
            paused: false,
            suspectIndex: 0,
            lineIndex: 0,
            revealed: 0,
          }
        : state;
    case 'type':
      return state.mode === 'suspect' && !state.paused && state.revealed < currentLine(state).length
        ? { ...state, revealed: state.revealed + 1 }
        : state;
    case 'next': {
      if (state.mode !== 'suspect' || state.paused) return state;
      if (!action.instant && state.revealed < currentLine(state).length)
        return { ...state, revealed: currentLine(state).length };
      if (state.lineIndex < suspects[state.suspectIndex].lines.length - 1)
        return { ...state, lineIndex: state.lineIndex + 1, revealed: 0 };
      if (state.review || state.suspectIndex === suspects.length - 1)
        return { ...state, mode: 'end', paused: false };
      return { ...state, suspectIndex: state.suspectIndex + 1, lineIndex: 0, revealed: 0 };
    }
    case 'pause':
      return state.mode === 'intro' || state.mode === 'suspect'
        ? { ...state, paused: true }
        : state;
    case 'toggle-pause':
      return state.mode === 'intro' || state.mode === 'suspect'
        ? { ...state, paused: !state.paused }
        : state;
    case 'review':
      return state.mode === 'end' &&
        Number.isInteger(action.index) &&
        action.index >= 0 &&
        action.index < suspects.length
        ? {
            ...state,
            mode: 'suspect',
            suspectIndex: action.index,
            lineIndex: 0,
            revealed: 0,
            paused: false,
            review: true,
            run: state.run + 1,
          }
        : state;
  }
}
