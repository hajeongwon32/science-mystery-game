import { suspects, type Suspect } from '../content';
import type { IntroState } from '../state';

export default function DialogueBox({
  person,
  state,
  text,
  onNext,
}: {
  person: Suspect;
  state: IntroState;
  text: string;
  onNext: () => void;
}) {
  const last = state.lineIndex === person.lines.length - 1;
  const nextLabel = !last
    ? '다음'
    : state.review
      ? '소개로 돌아가기'
      : state.suspectIndex === suspects.length - 1
        ? '진술을 마치다'
        : '다음 용의자';
  return (
    <section className="dialogue" aria-label="용의자 진술" onClick={onNext}>
      <div className="dialogue-top">
        <span>
          {person.role} · {person.name}
        </span>
        <span className="statement-tag">첫 번째 진술</span>
      </div>
      <p aria-live="polite">{text}</p>
      <div className="dialogue-bottom">
        <span>{state.paused ? '일시정지 중' : '클릭 또는 Space로 다음 대사'}</span>
        <button
          aria-label="다음 대사"
          onClick={(event) => {
            event.stopPropagation();
            onNext();
          }}
        >
          {nextLabel} <span>{state.review && last ? '↗' : '▹'}</span>
        </button>
      </div>
    </section>
  );
}
