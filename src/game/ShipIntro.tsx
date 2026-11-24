import { useEffect, useReducer, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { connections, opening, progress } from './introState';
import { detailAreas, doorAreas, roomImages, rooms, sceneImage } from './scenes';
import CrewBook from './CrewBook';
import { createShipSound } from './sound';
import WindowStudy from './WindowStudy';
import './ship.css';

const title = '창밖에 있던 사람';

function Hotspot({
  area,
  label,
  onClick,
  detail = false,
}: {
  area: { x: number; y: number; width: number; height: number };
  label: string;
  onClick: () => void;
  detail?: boolean;
}) {
  return (
    <button
      className={'hotspot' + (detail ? ' hotspot-detail' : '')}
      style={{
        left: area.x + '%',
        top: area.y + '%',
        width: area.width + '%',
        height: area.height + '%',
      }}
      onClick={onClick}
    >
      <span>{label}</span>
    </button>
  );
}

function Subtitle({ speaker, children }: { speaker?: string; children: ReactNode }) {
  return (
    <p className="subtitle">
      {speaker && <span>{speaker}</span>}
      {children}
    </p>
  );
}

function Voyage({ name, onRestart }: { name: string; onRestart: () => void }) {
  const [state, dispatch] = useReducer(progress, opening);
  const [muted, setMuted] = useState(false);
  const [windowOpen, setWindowOpen] = useState(false);
  const [speaking, setSpeaking] = useState<'cook' | 'navigator' | 'engineer' | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const sound = useRef<ReturnType<typeof createShipSound> | null>(null);
  const roomHeading = useRef<HTMLHeadingElement>(null);
  const { location, phase, luggage, report, lead } = state;
  const recorded = lead !== 'window';
  const room = rooms[location];
  const onBreak = phase === 'late-deck';
  const readyForBreak = phase === 'onboard' && luggage && report;
  const afterArrival = phase === 'aftermath';
  const investigating = phase === 'investigation';
  const late = phase !== 'arrival' && phase !== 'onboard';
  const atDiscovery = phase === 'discovery';
  const image = sceneImage(state);

  useEffect(() => {
    roomHeading.current?.focus();
  }, [location, windowOpen, phase]);

  useEffect(
    () => () => {
      const player = sound.current;
      sound.current = null;
      if (player) void player.close().catch(() => {});
    },
    [],
  );

  useEffect(() => {
    sound.current?.outdoors(location === 'deck');
  }, [location]);

  useEffect(() => {
    if (phase === 'sound') sound.current?.knock();
  }, [phase]);

  function enableSound() {
    if (sound.current) return;
    try {
      const player = createShipSound();
      sound.current = player;
      player.outdoors(location === 'deck');
      player.mute(muted);
      void player.resume().catch(() => {});
    } catch {
      // The scene remains usable on devices without Web Audio.
    }
  }

  function toggleSound() {
    enableSound();
    sound.current?.mute(!muted);
    setMuted(!muted);
  }

  let subtitle: ReactNode;
  if (phase === 'arrival') {
    subtitle = (
      <Subtitle speaker="한경수 · 갑판원">
        “첫날부터 고생했어요. 가방 아직 여기 있네. 침실 아래 칸 비워 뒀어요.”
      </Subtitle>
    );
  } else if (phase === 'onboard' && location === 'corridor') {
    subtitle = (
      <Subtitle speaker="조리원">
        {speaking === 'cook'
          ? '“국 여섯 그릇에 밥 여섯 공기. 오늘부턴 세다가 하나 빼먹으면 네 몫이 없어.”'
          : '“잠깐만, 그릇 지나간다. 경수 형은 왼쪽 조타실에 있어.”'}
      </Subtitle>
    );
  } else if (phase === 'onboard' && location === 'cabin' && speaking === 'engineer') {
    subtitle = (
      <Subtitle speaker="기관장">
        “그물 올리는 기계가 멈춰서 다들 일찍 들어왔지. 장갑을 두 겹 꼈는데도 기름이 배네.”
      </Subtitle>
    );
  } else if (phase === 'onboard' && location === 'cabin') {
    subtitle = luggage ? (
      <Subtitle>아래 침상에 가방을 밀어 넣었다. 젖은 소맷자락에서 소금 냄새가 난다.</Subtitle>
    ) : (
      <Subtitle speaker="기관장">
        “가방 내려놔. 거기 아래 칸 네 자리야. 내 손엔 기름이 묻어서.”
      </Subtitle>
    );
  } else if (phase === 'onboard' && location === 'bridge' && speaking === 'navigator') {
    subtitle = (
      <Subtitle speaker="항해사">
        “왼쪽에 불 두 개 보이지? 그 사이가 항구 입구야. 경수 아저씨, 종이 날아가요.”
      </Subtitle>
    );
  } else if (phase === 'onboard' && location === 'bridge') {
    subtitle = report ? (
      <Subtitle speaker="한경수">
        “그냥 넘어가자는데, 다음에 또 멈추면요? 내가 본 건 적어 둬야죠.”
      </Subtitle>
    ) : (
      <Subtitle speaker="한경수">
        “아까 장비 멈췄던 거 기억나죠? 항구 들어가기 전에 적어 두려고요.”
      </Subtitle>
    );
  } else if (readyForBreak && location === 'deck') {
    subtitle = (
      <Subtitle>경수 씨는 아직 쓰는 중이다. 난간 너머로 항구 불빛이 하나둘 들어온다.</Subtitle>
    );
  } else if (onBreak) {
    subtitle = (
      <Subtitle speaker="20분 뒤">
        어느새 손등이 차다. 난간에서 몸을 떼니 굳었던 무릎이 펴진다.
      </Subtitle>
    );
  } else if (phase === 'sound' && location === 'corridor') {
    subtitle = (
      <Subtitle>조타실에서 쿵, 하는 소리. 선장이 문 안쪽에서 경수 씨 이름을 부른다.</Subtitle>
    );
  } else if (atDiscovery) {
    subtitle = (
      <Subtitle speaker="선장">
        “경수 씨, 들려요? …잠깐, 거기까지만. 구조 요청했어. 밖에서 문 좀 잡아 줘.”
      </Subtitle>
    );
  } else if (investigating && location === 'bridge') {
    subtitle = recorded ? (
      <Subtitle speaker="수첩 · 첫 관찰">
        바깥 풍경은 유리를 통과해 보였고, 안쪽 책상등은 유리에 반사돼 기둥과 겹쳤다. 불빛만으로 경수
        씨의 위치를 단정할 수 없다.{' '}
        {lead === 'light' && '복도로 돌아가 조리원의 기억을 다시 들어 보자.'}
      </Subtitle>
    ) : (
      <Subtitle speaker="조리원">
        “여기 문턱에 섰는데, 저 기둥 옆에 노란불이 하나 있더라고요. 경수 형이 손전등 들고 나온 줄
        알았죠.”
      </Subtitle>
    );
  } else if (investigating && location === 'corridor') {
    if (lead === 'engineer') {
      subtitle = <Subtitle>정비표 사본에 관한 두 사람의 말을 수첩에 적었다.</Subtitle>;
    } else if (lead === 'paper') {
      subtitle = (
        <Subtitle speaker="조리원">
          “불빛 말고 내가 직접 본 거요? 저녁 전에 여기서 기관장님이 경수 형한테 종이 한 장 건넸어요.
          침실에 가 봐요.”
        </Subtitle>
      );
    } else if (recorded) {
      subtitle = (
        <Subtitle>
          조리원이 그릇을 내려놓으려다 말고 나를 본다. 불빛 말고 직접 본 일이 있었을까?
        </Subtitle>
      );
    } else {
      subtitle = (
        <Subtitle speaker="조리원">
          “어디서 봤냐고요? 조타실 문턱에 서 봐요. 거기서 보였어요.”
        </Subtitle>
      );
    }
  } else if (investigating && location === 'cabin') {
    subtitle =
      lead === 'engineer' ? (
        <Subtitle speaker="기관장">
          “그 종이? 양망기 정비표 사본이야. 경수가 보고서에 붙이겠대서 줬어. 그게 내가 본
          마지막이야.”
        </Subtitle>
      ) : (
        <Subtitle speaker="기관장">
          {lead === 'paper'
            ? '“조리원이 나한테 가 보래? 뭘 물으려고?”'
            : '“그날 얘기 들으러 왔어? 조리원이 조타실 쪽에 있더라.”'}
        </Subtitle>
      );
  } else if (investigating && location === 'deck' && !recorded) {
    subtitle = (
      <Subtitle>
        여기서는 뱃머리를 직접 볼 수 있다. 조리원이 본 건 조타실 창을 거친 풍경이다.
      </Subtitle>
    );
  }

  if (windowOpen) {
    return (
      <main className="ship">
        <div className="scene">
          <WindowStudy
            onLeave={() => setWindowOpen(false)}
            onRecord={() => {
              dispatch({ type: 'record-window' });
              setWindowOpen(false);
            }}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="ship">
      <div
        className="scene"
        data-location={location}
        data-phase={phase}
        data-light={late ? 'night' : 'dusk'}
      >
        <img
          className="scene-image"
          src={image}
          key={image}
          alt={
            atDiscovery
              ? '경수가 조타실 바닥에 쓰러져 있다. 곁에 무릎을 꿇은 선장이 문 쪽을 보며 한 손을 들어 보인다.'
              : ''
          }
        />
        <header className="ship-header">
          <div>
            <p>{title}</p>
            <h1 ref={roomHeading} tabIndex={-1}>
              {room.name}
            </h1>
          </div>
          <div className="ship-tools">
            <CrewBook name={name} lead={lead} onRestart={onRestart} />
            <button className="quiet-button" onClick={toggleSound} aria-pressed={muted}>
              {muted ? '소리 켜기' : '음소거'}
            </button>
          </div>
        </header>

        {connections[location].map((destination) => {
          const area = doorAreas[location][destination];
          return (
            area && (
              <Hotspot
                key={destination}
                area={area}
                label={atDiscovery ? '복도로 물러나기' : rooms[destination].direction}
                onClick={() => {
                  enableSound();
                  setReportOpen(false);
                  setSpeaking(null);
                  dispatch({ type: 'move', to: destination });
                }}
              />
            )
          );
        })}

        {phase === 'onboard' && location === 'bridge' && !reportOpen && (
          <Hotspot
            detail
            area={detailAreas.navigator}
            label="항해사"
            onClick={() => setSpeaking('navigator')}
          />
        )}
        {phase === 'onboard' && location === 'cabin' && (
          <Hotspot
            detail
            area={detailAreas.engineer}
            label="기관장"
            onClick={() => setSpeaking('engineer')}
          />
        )}
        {phase === 'onboard' && location === 'corridor' && (
          <Hotspot
            detail
            area={detailAreas.cook}
            label="조리원"
            onClick={() => setSpeaking('cook')}
          />
        )}
        {investigating && location === 'corridor' && lead === 'light' && (
          <Hotspot
            detail
            area={detailAreas.cook}
            label="직접 본 일 묻기"
            onClick={() => dispatch({ type: 'ask-cook' })}
          />
        )}
        {investigating && location === 'cabin' && lead === 'paper' && (
          <Hotspot
            detail
            area={detailAreas.engineer}
            label="건네준 종이 묻기"
            onClick={() => dispatch({ type: 'ask-engineer' })}
          />
        )}

        {readyForBreak && location === 'deck' && (
          <Hotspot
            detail
            area={detailAreas.railing}
            label="난간에서 바람 쐬기"
            onClick={() => dispatch({ type: 'rest-on-deck' })}
          />
        )}

        {phase === 'onboard' && location === 'cabin' && !luggage && (
          <Hotspot
            detail
            area={detailAreas.berth}
            label="침상에 짐 두기"
            onClick={() => {
              setSpeaking(null);
              dispatch({ type: 'observe', task: 'luggage' });
            }}
          />
        )}
        {phase === 'onboard' && location === 'bridge' && !reportOpen && (
          <Hotspot
            detail
            area={detailAreas.report}
            label="보고서 살펴보기"
            onClick={() => {
              setSpeaking(null);
              dispatch({ type: 'observe', task: 'report' });
              setReportOpen(true);
            }}
          />
        )}
        {phase === 'onboard' && location === 'bridge' && reportOpen && (
          <aside className="ship-report">
            <p>귀항 후 제출 예정</p>
            <h2>장비 이상 보고서</h2>
            <p>그물 올리던 중 양망기가 멎음. 오늘 조업은 여기서 중단.</p>
            <p>확인자 한경수</p>
            <button className="paper-close" autoFocus onClick={() => setReportOpen(false)}>
              종이 내려놓기
            </button>
          </aside>
        )}
        {investigating && location === 'bridge' && (
          <Hotspot
            detail
            area={detailAreas.window}
            label="창문 살펴보기"
            onClick={() => setWindowOpen(true)}
          />
        )}

        <div className="scene-footer">
          <div aria-live="polite">{subtitle}</div>
          {phase === 'onboard' && location === 'corridor' && (
            <p className="objective">
              {!luggage && !report
                ? '침실에 짐을 두고 조타실에 들르세요.'
                : readyForBreak
                  ? '갑판에 나가 잠깐 쉬세요.'
                  : luggage
                    ? '조타실에 들르세요.'
                    : '침실에 짐을 두세요.'}
            </p>
          )}
          {afterArrival && location === 'corridor' && (
            <div className="discovery">
              <Subtitle speaker="며칠 뒤 · 다시 찾은 배">
                입항 뒤 구조대가 경수 씨를 데려갔고, 그날 밤 부고가 왔다. 오늘은 조리원이 문을 잡아
                준다. “조타실에 서 봐요. 여기서 봤어요.”
              </Subtitle>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function ShipIntro() {
  const [nickname, setNickname] = useState('');
  const [onboard, setOnboard] = useState(false);

  useEffect(() => {
    for (const source of roomImages) {
      const image = new Image();
      image.src = source;
    }
  }, []);

  function board(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (nickname.trim()) setOnboard(true);
  }

  function restart() {
    setNickname('');
    setOnboard(false);
  }

  if (onboard) return <Voyage name={nickname.trim()} onRestart={restart} />;

  return (
    <main className="ship title-screen">
      <div className="scene">
        <img className="scene-image" src={rooms.deck.image} alt="" />
        <section className="title-content">
          <p className="chapter">마지막 한 줄</p>
          <h1>
            창밖에
            <br />
            있던 사람
          </h1>
          <p className="title-setting">첫 조업을 마치고 항구로 돌아가던 저녁이었다.</p>
          <form onSubmit={board}>
            <label htmlFor="crew-name">닉네임</label>
            <div className="start-fields">
              <input
                id="crew-name"
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                maxLength={20}
                autoComplete="off"
                required
              />
              <button className="primary-button" type="submit" disabled={!nickname.trim()}>
                귀항길 시작
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
