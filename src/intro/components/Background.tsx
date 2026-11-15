import type { CSSProperties } from 'react';
import { assets } from '../assets';
import type { Scene } from '../content';

export default function Background({
  scene,
  reducedMotion,
}: {
  scene: Scene;
  reducedMotion: boolean;
}) {
  const inside = scene !== 'corridor';
  const roomStyle: CSSProperties = {
    opacity: inside ? 1 : 0,
    transform: reducedMotion ? 'none' : scene === 'desk' ? 'scale(1.2)' : 'scale(1.035)',
    transformOrigin: '24% 66%',
  };
  return (
    <>
      <div className="scenery" aria-hidden="true">
        <img
          className="background corridor"
          src={assets.corridor}
          style={{ opacity: inside ? 0 : 1 }}
          alt=""
        />
        <img className="background room" src={assets.room} style={roomStyle} alt="" />
      </div>
      <div className="shade" aria-hidden="true" />
      <div className="rain-glow" aria-hidden="true" />
    </>
  );
}
