export default function StartScreen({
  ready,
  starting,
  onStart,
}: {
  ready: boolean;
  starting: boolean;
  onStart: () => void;
}) {
  return (
    <section className="start">
      <p className="eyebrow">A SCIENCE MYSTERY</p>
      <div className="small-rule" />
      <h1>
        마지막
        <br />
        <span>한 줄</span>
        <em>THE LAST LINE</em>
      </h1>
      <p className="start-description">
        한 사람은 말을 남겼고,
        <br />네 사람은 말을 아꼈다.
      </p>
      <button id="play" className="primary" disabled={!ready || starting} onClick={onStart}>
        {!ready ? '장면 준비 중' : starting ? '시작하는 중' : '이야기 시작'} <span>↗</span>
      </button>
      <p className="start-note">
        약 40초의 오프닝 · 이어서 네 용의자를 만납니다
        <br />
        소리는 시작 버튼을 누르면 재생됩니다
      </p>
    </section>
  );
}
