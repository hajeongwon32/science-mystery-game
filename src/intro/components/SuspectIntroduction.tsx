import { suspects, type Suspect } from '../content';
import type { IntroController } from '../useIntro';
import DialogueBox from './DialogueBox';

export function Character({ person, index }: { person: Suspect; index: number }) {
  return (
    <div
      key={index}
      className="character"
      role="img"
      aria-label={`${person.role} ${person.name}`}
      style={{ backgroundPositionX: `${(index / (suspects.length - 1)) * 100}%` }}
    />
  );
}

export default function SuspectIntroduction({ intro }: { intro: IntroController }) {
  const { state, text, next } = intro;
  const person = suspects[state.suspectIndex];
  return (
    <>
      <aside className="identity" key={`identity-${state.suspectIndex}`}>
        <p className="eyebrow">PERSON OF INTEREST / 0{state.suspectIndex + 1}</p>
        <h2>{person.role}</h2>
        <p className="suspect-name">{person.name}</p>
        <div className="small-rule" />
        <p className="relation">{person.relation}</p>
      </aside>
      <DialogueBox person={person} state={state} text={text} onNext={next} />
    </>
  );
}
