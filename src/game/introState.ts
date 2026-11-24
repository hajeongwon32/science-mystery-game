export type Location = 'deck' | 'corridor' | 'bridge' | 'cabin';
type Phase =
  'arrival' | 'onboard' | 'late-deck' | 'sound' | 'discovery' | 'aftermath' | 'investigation';
type Task = 'luggage' | 'report';

export type IntroState = {
  location: Location;
  phase: Phase;
  luggage: boolean;
  report: boolean;
  lead: 'window' | 'light' | 'paper' | 'engineer';
};

export type IntroAction =
  | { type: 'move'; to: Location }
  | { type: 'observe'; task: Task }
  | { type: 'rest-on-deck' }
  | { type: 'record-window' }
  | { type: 'ask-cook' }
  | { type: 'ask-engineer' };

export const connections: Readonly<Record<Location, readonly Location[]>> = {
  deck: ['corridor'],
  corridor: ['bridge', 'deck', 'cabin'],
  bridge: ['corridor'],
  cabin: ['corridor'],
};

export const opening: IntroState = {
  location: 'deck',
  phase: 'arrival',
  luggage: false,
  report: false,
  lead: 'window',
};

export function progress(state: IntroState, action: IntroAction): IntroState {
  switch (action.type) {
    case 'move': {
      if (!connections[state.location].includes(action.to)) return state;
      const next = { ...state, location: action.to };
      if (state.phase === 'arrival') return { ...next, phase: 'onboard' };
      if (state.phase === 'late-deck') return { ...next, phase: 'sound' };
      if (state.phase === 'sound' && next.location === 'bridge')
        return { ...next, phase: 'discovery' };
      if (state.phase === 'discovery') return { ...next, phase: 'aftermath' };
      if (state.phase === 'aftermath') return { ...next, phase: 'investigation' };
      return next;
    }
    case 'observe':
      if (state.phase !== 'onboard') return state;
      if (action.task === 'luggage' && state.location === 'cabin')
        return { ...state, luggage: true };
      if (action.task === 'report' && state.location === 'bridge')
        return { ...state, report: true };
      return state;
    case 'rest-on-deck':
      return state.phase === 'onboard' && state.location === 'deck' && state.luggage && state.report
        ? { ...state, phase: 'late-deck' }
        : state;
    case 'record-window':
      if (state.phase === 'investigation' && state.location === 'bridge' && state.lead === 'window')
        return { ...state, lead: 'light' };
      return state;
    case 'ask-cook':
      if (
        state.phase === 'investigation' &&
        state.location === 'corridor' &&
        state.lead === 'light'
      )
        return { ...state, lead: 'paper' };
      return state;
    case 'ask-engineer':
      if (state.phase === 'investigation' && state.location === 'cabin' && state.lead === 'paper')
        return { ...state, lead: 'engineer' };
      return state;
  }
}
