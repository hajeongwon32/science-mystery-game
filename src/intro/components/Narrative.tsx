import type { StoryBeat } from '../content';

export default function Narrative({ beat }: { beat: StoryBeat }) {
  return (
    <>
      <div className="location">
        <span>23:17</span>
        <i />
        <span>{beat.scene === 'corridor' ? '호텔 5층 · 복도' : '507호 · 사건 현장'}</span>
      </div>
      {beat.kind === 'chapter' ? (
        <section className="chapter" aria-live="polite">
          <span>{beat.kicker}</span>
          <h2>{beat.title}</h2>
          <p>{beat.subtitle}</p>
        </section>
      ) : (
        <section className="caption" aria-live="polite">
          <span>{beat.speaker}</span>
          <p>{beat.text}</p>
        </section>
      )}
    </>
  );
}
