import { suspects } from '../content';

export default function EndingScreen({
  onReplay,
  onReview,
}: {
  onReplay: () => void;
  onReview: (index: number) => void;
}) {
  return (
    <section className="ending">
      <p className="eyebrow">네 사람의 이야기를 들었다.</p>
      <h2>
        누구의 말을
        <br />
        <em>믿을 것인가.</em>
      </h2>
      <p className="ending-copy">
        그들이 한 말, 남겨진 흔적.
        <br />
        이제 당신이 확인할 차례다.
      </p>
      <div className="cast-review" aria-label="용의자 진술 다시 보기">
        {suspects.map((person, index) => (
          <button key={person.role} onClick={() => onReview(index)}>
            <span className={`mini-face face-${index}`} />
            <span>{person.role}</span>
          </button>
        ))}
      </div>
      <button className="primary" onClick={onReplay}>
        처음부터 다시 보기 <span>↺</span>
      </button>
      <p className="ending-note">PROLOGUE END</p>
    </section>
  );
}
