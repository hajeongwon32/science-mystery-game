import { useEffect, useRef, useState } from 'react';
import { bridgeEmpty } from './scenes';

type Props = {
  onLeave: () => void;
  onRecord: () => void;
};

export default function WindowStudy({ onLeave, onRecord }: Props) {
  const [lit, setLit] = useState(true);
  const [compared, setCompared] = useState(false);
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
            (compared
              ? '이 관찰을 바탕으로 수첩에 무엇을 적을까?'
              : lit
                ? '뱃머리 기둥 옆에 노란불이 보인다. 이 자리에 서서 조리원에게 책상등을 꺼 달라고 해 보자.'
                : '기둥은 그대로 보인다. 다시 불을 켜면 어떻게 될까?')}
        </p>
        <button className="quiet-button" onClick={switchLamp}>
          {lit ? '책상등 끄기' : '책상등 켜기'}
        </button>
        {compared && (
          <div className="study-choices" role="group" aria-label="수첩에 적을 관찰">
            <button
              onClick={() =>
                setFeedback(
                  '기둥 옆 빛은 사라졌지만, 그날 그곳에 누가 서 있었는지는 이 창으로 확인할 수 없다. 다시 적어 보자.',
                )
              }
            >
              그날 뱃머리에는 아무도 없었다.
            </button>
            <button onClick={onRecord}>안쪽 책상등도 뱃머리의 불빛처럼 보인다.</button>
          </div>
        )}
      </div>
    </section>
  );
}
