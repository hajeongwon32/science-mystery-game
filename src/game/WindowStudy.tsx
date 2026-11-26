import { useEffect, useRef, useState } from 'react';
import { bridgeEmpty } from './scenes';

type Props = {
  onLeave: () => void;
  onRecord: () => void;
};

export default function WindowStudy({ onLeave, onRecord }: Props) {
  const [lit, setLit] = useState(true);
  const [compared, setCompared] = useState(false);
  const [asked, setAsked] = useState(false);
  const [feedback, setFeedback] = useState('');
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => heading.current?.focus(), []);

  function switchLamp() {
    setLit(!lit);
    if (!lit) setCompared(true);
    setFeedback('');
  }

  return (
    <section className="window-study" aria-label="조타실 창문 관찰">
      <div
        className="window-view"
        role="img"
        aria-label={
          lit
            ? '뱃머리의 기둥 옆으로 노란 빛이 겹쳐 보인다.'
            : '같은 창 너머로 뱃머리 기둥과 수평선이 보인다. 기둥 옆의 노란 빛은 사라졌다.'
        }
      >
        <img src={bridgeEmpty} alt="" />
        <div className="glass-light" data-lit={lit} />
      </div>
      <header className="study-header">
        <h2 tabIndex={-1} ref={heading}>
          조리원이 섰던 자리
        </h2>
        <button className="quiet-button" onClick={onLeave}>
          창에서 물러나기
        </button>
      </header>
      <div className="study-notes">
        <p className="subtitle" aria-live="polite">
          {feedback ||
            (!asked
              ? '내가 마지막으로 본 경수 씨는 조타실에서 글을 쓰고 있었다. 그 뒤에 정말 갑판으로 나갔을까?'
              : compared
                ? '조리원이 본 불빛을 경수 씨의 마지막 위치로 기록해도 될까?'
                : lit
                  ? '조리원 “얼굴까지는요. 저기 불 보이죠? 그날도 딱 저렇게 보였어요.” 오늘도 같은 곳에 불이 보인다.'
                  : '기둥은 그대로 보인다. 다시 불을 켜면 어떻게 될까?')}
        </p>
        {!asked ? (
          <button className="quiet-button" onClick={() => setAsked(true)}>
            “경수 씨 얼굴도 보셨어요?”
          </button>
        ) : (
          <button className="quiet-button" onClick={switchLamp}>
            {lit ? '책상등 끄기' : '책상등 켜기'}
          </button>
        )}
        {compared && (
          <div className="study-choices" role="group" aria-label="수첩에 적을 관찰">
            <button
              onClick={() =>
                setFeedback(
                  '책상등을 끄자 사라진 건 오늘 창에 보인 빛이다. 그날 경수 씨가 어디에 있었는지는 다른 목격이 필요하다.',
                )
              }
            >
              경수 씨는 조타실에 계속 있었다.
            </button>
            <button onClick={onRecord}>갑판 목격은 보류하고 얼굴을 본 시점을 묻는다.</button>
          </div>
        )}
      </div>
    </section>
  );
}
