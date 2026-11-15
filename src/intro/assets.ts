import corridor from './assets/corridor.png';
import room from './assets/room.png';
import cast from './assets/cast.png';

export const assets = { corridor, room, cast };
export function preloadAssets(): Promise<void> {
  return Promise.all(
    Object.values(assets).map((src) => {
      const image = new Image();
      image.src = src;
      return image.decode();
    }),
  ).then(() => undefined);
}
