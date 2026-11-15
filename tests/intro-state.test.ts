import test from 'node:test';
import assert from 'node:assert/strict';
import { INTRO_DURATION, getBeatIndex, suspects } from '../src/intro/content.ts';
import { currentLine, initialState, introReducer } from '../src/intro/state.ts';

test('timeline reaches the first suspect at 40 seconds, never before', () => {
  let state = introReducer(initialState, { type: 'start' });
  state = introReducer(state, { type: 'tick', seconds: 39.9 });
  assert.equal(state.mode, 'intro');
  state = introReducer(state, { type: 'tick', seconds: 0.2 });
  assert.equal(state.mode, 'suspect');
  assert.equal(state.elapsed, INTRO_DURATION);
  assert.equal(state.suspectIndex, 0);
  assert.equal(state.lineIndex, 0);
});

test('pause freezes time and dialogue; skipping a paused intro resumes at the first suspect', () => {
  let state = introReducer(initialState, { type: 'start' });
  state = introReducer(state, { type: 'tick', seconds: 9 });
  state = introReducer(state, { type: 'pause' });
  assert.strictEqual(introReducer(state, { type: 'tick', seconds: 100 }), state);
  state = introReducer(state, { type: 'skip' });
  assert.equal(state.paused, false);
  state = introReducer(state, { type: 'pause' });
  assert.strictEqual(introReducer(state, { type: 'type' }), state);
  assert.strictEqual(introReducer(state, { type: 'next', instant: false }), state);
});

test('clicking a partly typed line reveals it before advancing to another line', () => {
  let state = introReducer(introReducer(initialState, { type: 'start' }), { type: 'skip' });
  state = introReducer(state, { type: 'type' });
  state = introReducer(state, { type: 'next', instant: false });
  assert.equal(state.lineIndex, 0);
  assert.equal(state.revealed, currentLine(state).length);
  state = introReducer(state, { type: 'next', instant: false });
  assert.equal(state.lineIndex, 1);
  assert.equal(state.revealed, 0);
});

test('all four introductions finish in order; reduced motion needs no extra reveal click', () => {
  let state = introReducer(introReducer(initialState, { type: 'start' }), { type: 'skip' });
  for (let index = 0; index < suspects.length; index++) {
    for (let line = 0; line < suspects[index].lines.length; line++) {
      assert.equal(state.suspectIndex, index);
      assert.equal(state.lineIndex, line);
      state = introReducer(state, { type: 'next', instant: true });
    }
  }
  assert.equal(state.mode, 'end');
});

test('review returns to the ending instead of unexpectedly continuing through other suspects', () => {
  const end = { ...initialState, mode: 'end' as const };
  let state = introReducer(end, { type: 'review', index: 1 });
  assert.equal(state.suspectIndex, 1);
  for (const _ of suspects[1].lines) state = introReducer(state, { type: 'next', instant: true });
  assert.equal(state.mode, 'end');
  assert.strictEqual(introReducer(end, { type: 'review', index: 99 }), end);
});

test('replay and home reset progress, pause and review state', () => {
  const end = {
    ...initialState,
    mode: 'end' as const,
    review: true,
    suspectIndex: 3,
    lineIndex: 1,
    paused: true,
    run: 4,
  };
  const replay = introReducer(end, { type: 'start' });
  assert.deepEqual(replay, { ...initialState, mode: 'intro', run: 5 });
  const home = introReducer(replay, { type: 'home' });
  assert.deepEqual(home, { ...initialState, run: 6 });
  assert.strictEqual(introReducer(home, { type: 'tick', seconds: 100 }), home);
});

test('invalid timing input cannot corrupt progress; scene boundaries select the new beat', () => {
  const state = introReducer(initialState, { type: 'start' });
  for (const seconds of [NaN, Infinity, -1, 0])
    assert.strictEqual(introReducer(state, { type: 'tick', seconds }), state);
  assert.equal(getBeatIndex(14.999), 2);
  assert.equal(getBeatIndex(15), 3);
  assert.equal(getBeatIndex(36), 7);
});
