import type { IntroState, Location } from './introState';
import bridgeEmpty from './assets/bridge-empty.webp';
import deck from './assets/deck.webp';
import corridor from './assets/corridor.webp';
import cabin from './assets/cabin.webp';
import cook from './assets/cook.webp';
import navigator from './assets/navigator.webp';
import engineer from './assets/engineer.webp';
import discovery from './assets/bridge-discovery.webp';

type Area = { x: number; y: number; width: number; height: number };

export const rooms: Record<Location, { name: string; direction: string; image: string }> = {
  deck: { name: '바깥 갑판', direction: '갑판으로', image: deck },
  corridor: { name: '복도', direction: '복도로', image: corridor },
  bridge: { name: '조타실', direction: '조타실로', image: navigator },
  cabin: { name: '선원 침실', direction: '침실로', image: cabin },
};

export const doorAreas: Record<Location, Partial<Record<Location, Area>>> = {
  deck: { corridor: { x: 88, y: 52, width: 19, height: 71 } },
  corridor: {
    bridge: { x: 21, y: 51, width: 20, height: 77 },
    deck: { x: 50, y: 48, width: 21, height: 55 },
    cabin: { x: 82, y: 51, width: 20, height: 77 },
  },
  bridge: { corridor: { x: 7, y: 52, width: 13, height: 77 } },
  cabin: { corridor: { x: 12, y: 51, width: 21, height: 82 } },
};

export const detailAreas = {
  berth: { x: 68, y: 76, width: 42, height: 21 },
  report: { x: 68, y: 63, width: 21, height: 20 },
  railing: { x: 29, y: 53, width: 32, height: 36 },
  window: { x: 59, y: 28, width: 28, height: 19 },
  cook: { x: 65, y: 49, width: 11, height: 42 },
  navigator: { x: 31, y: 47, width: 17, height: 50 },
  engineer: { x: 33, y: 56, width: 15, height: 38 },
} satisfies Record<string, Area>;

export { bridgeEmpty };

export const roomImages = [
  ...Object.values(rooms).map((room) => room.image),
  bridgeEmpty,
  cook,
  engineer,
  discovery,
];

export function sceneImage({ location, phase }: IntroState) {
  const beforeIncident = phase === 'onboard';
  const askingCrew = phase === 'investigation' || phase === 'aftermath';
  if (location === 'bridge') {
    if (phase === 'discovery') return discovery;
    return beforeIncident ? navigator : bridgeEmpty;
  }
  if (location === 'corridor' && (beforeIncident || askingCrew)) return cook;
  if (location === 'cabin' && (beforeIncident || askingCrew)) return engineer;
  return rooms[location].image;
}
