import type { IntroController } from '../useIntro';

export default function PlaybackControls({
  intro,
  onFullscreen,
}: {
  intro: IntroController;
  onFullscreen: () => void;
}) {
  const { state, dispatch, muted, setMuted, volume, setVolume } = intro;
  const canPause = state.mode === 'intro' || state.mode === 'suspect';
  return (
    <header className="topbar">
      <a
        className="wordmark"
        href="#"
        aria-label="처음 화면"
        onClick={(event) => {
          event.preventDefault();
          dispatch({ type: 'home' });
        }}
      >
        마지막 한 줄<span>PROLOGUE</span>
      </a>
      <nav aria-label="재생 설정">
        {canPause && (
          <button
            onClick={() => dispatch({ type: 'toggle-pause' })}
            aria-label={state.paused ? '재생' : '일시정지'}
          >
            {state.paused ? '▷' : 'Ⅱ'}
          </button>
        )}
        <button
          id="mute"
          aria-pressed={muted}
          aria-label={muted ? '소리 켜기' : '소리 끄기'}
          onClick={() => setMuted((value) => !value)}
        >
          <span id="soundIcon">{muted ? '♪̸' : '♫'}</span>
          <span id="soundLabel">{muted ? '소리 꺼짐' : '소리 켜짐'}</span>
        </button>
        <label className="sr-only" htmlFor="volume">
          음량
        </label>
        <input
          id="volume"
          type="range"
          min="0"
          max="100"
          value={Math.round(volume * 100)}
          aria-label="음량"
          onChange={(event) => setVolume(Number(event.target.value) / 100)}
        />
        {state.mode === 'intro' && (
          <button id="skip" onClick={() => dispatch({ type: 'skip' })}>
            용의자 소개로 <span>↗</span>
          </button>
        )}
        <button id="fullscreen" aria-label="전체 화면" onClick={onFullscreen}>
          ⛶
        </button>
      </nav>
    </header>
  );
}
