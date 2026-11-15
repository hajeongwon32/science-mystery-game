import { useRef } from 'react';
import { INTRO_DURATION, suspects } from './content';
import { useIntro } from './useIntro';
import Background from './components/Background';
import PlaybackControls from './components/PlaybackControls';
import StartScreen from './components/StartScreen';
import Narrative from './components/Narrative';
import SuspectIntroduction, { Character } from './components/SuspectIntroduction';
import EndingScreen from './components/EndingScreen';
import './intro.css';

export default function HotelIntro() {
  const intro = useIntro();
  const { state, beat, beatIndex } = intro;
  const stage = useRef<HTMLElement>(null);
  const scene = state.mode === 'intro' ? beat.scene : state.mode === 'idle' ? 'corridor' : 'room';
  const progress =
    state.mode === 'intro'
      ? (state.elapsed / INTRO_DURATION) * 65
      : state.mode === 'suspect'
        ? 65 + state.suspectIndex * 8
        : state.mode === 'end'
          ? 100
          : 0;
  const footerLabel =
    state.mode === 'suspect'
      ? '네 사람의 첫 번째 진술'
      : state.mode === 'end'
        ? '마지막 한 줄'
        : 'HOTEL · 507';
  const footerHint =
    state.mode === 'intro'
      ? `${String(Math.floor(state.elapsed)).padStart(2, '0')} / 40`
      : state.mode === 'suspect'
        ? `0${state.suspectIndex + 1} / 04`
        : state.mode === 'end'
          ? 'PROLOGUE END'
          : 'INTRO STUDY / 01';
  const fullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await stage.current?.requestFullscreen();
    } catch {
      intro.setError(
        '전체 화면을 지원하지 않는 환경입니다. 브라우저에서 F11을 사용할 수 있습니다.',
      );
    }
  };
  return (
    <main
      id="stage"
      ref={stage}
      data-mode={state.mode}
      data-renderer="react"
      aria-label="마지막 한 줄, 호텔 사건 인트로"
    >
      <Background scene={scene} reducedMotion={intro.reducedMotion} />
      {state.mode === 'suspect' && (
        <Character index={state.suspectIndex} person={suspects[state.suspectIndex]} />
      )}
      <div className="grain" aria-hidden="true" />
      <PlaybackControls intro={intro} onFullscreen={() => void fullscreen()} />
      {state.mode === 'idle' && (
        <StartScreen
          ready={intro.ready}
          starting={intro.starting}
          onStart={() => void intro.start()}
        />
      )}
      {state.mode === 'intro' && <Narrative key={`${state.run}-${beatIndex}`} beat={beat} />}
      {state.mode === 'suspect' && <SuspectIntroduction intro={intro} />}
      {state.mode === 'end' && (
        <EndingScreen
          onReplay={() => void intro.start()}
          onReview={(index) => intro.dispatch({ type: 'review', index })}
        />
      )}
      <footer>
        <span>{footerLabel}</span>
        <span>{footerHint}</span>
      </footer>
      <div className="progress" aria-hidden="true">
        <span style={{ width: `${progress}%` }} />
      </div>
      {intro.error && (
        <p id="error" role="alert">
          {intro.error}
        </p>
      )}
    </main>
  );
}
