import { useRef } from 'react';
import type { IntroState } from './introState';

const crew = [
  ['선장', '배 전체를 책임진다.'],
  ['항해사', '청록색 점퍼. 조타실에서 키를 잡는다.'],
  ['기관장', '황토색 작업복. 엔진과 갑판 기계를 돌본다.'],
  ['조리원', '앞치마를 두르고 선원들 식사를 챙긴다.'],
  ['갑판원 한경수', '붉은 조끼에 안경. 갑판에서 그물을 올린다.'],
];

export default function CrewBook({
  name,
  lead,
  onRestart,
}: {
  name: string;
  lead: IntroState['lead'];
  onRestart: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button className="quiet-button" onClick={() => dialog.current?.showModal()}>
        선원 수첩
      </button>
      <dialog className="crew-book" ref={dialog} aria-labelledby="crew-heading">
        <header>
          <h2 id="crew-heading">{name}의 선원 수첩</h2>
          <form method="dialog">
            <button autoFocus>닫기</button>
          </form>
        </header>
        <h3>승선 인원 · 6명</h3>
        <dl>
          {[...crew, [name + ' · 나', '이번에 처음 승선한 선원.']].map(([role, description]) => (
            <div key={role}>
              <dt>{role}</dt>
              <dd>{description}</dd>
            </div>
          ))}
        </dl>
        {lead !== 'window' && (
          <section>
            <h3>조사 기록</h3>
            <ul>
              <li>
                책상등의 반사가 바깥 기둥에 겹쳤다. 불빛만으로 경수 씨가 어디 있었는지는 알 수 없다.
              </li>
              {(lead === 'paper' || lead === 'engineer') && (
                <li>
                  조리원은 사건 전 복도에서 기관장이 경수 씨에게 종이를 건네는 모습을 봤다고 했다.
                </li>
              )}
              {lead === 'engineer' && (
                <li>
                  기관장은 그 종이가 양망기 정비표 사본이었고 경수 씨가 보고서에 붙이려고 가져갔다고
                  했다.
                </li>
              )}
            </ul>
          </section>
        )}
        {lead === 'engineer' && (
          <button className="book-restart" onClick={onRestart}>
            처음부터 다시 플레이
          </button>
        )}
      </dialog>
    </>
  );
}
