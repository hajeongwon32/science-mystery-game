import assert from 'node:assert/strict';
import test from 'node:test';
import {
  connections,
  opening,
  progress,
  type IntroState,
  type Location,
} from '../src/game/introState.ts';

const move = (state: IntroState, to: Location) => progress(state, { type: 'move', to });

test('all three doors lead back to the same corridor', () => {
  const corridor = move(opening, 'corridor');
  assert.deepEqual(connections.corridor, ['bridge', 'deck', 'cabin']);
  for (const destination of connections.corridor) {
    const room = move(corridor, destination);
    assert.equal(room.location, destination);
    assert.deepEqual(move(room, 'corridor'), corridor);
  }
  assert.deepEqual(move(opening, 'cabin'), opening);
});

test('leaving either room is uneventful until the player has spent time on deck', () => {
  for (const firstRoom of ['cabin', 'bridge'] as const) {
    const secondRoom = firstRoom === 'cabin' ? 'bridge' : 'cabin';
    const corridor = move(opening, 'corridor');
    const first = progress(move(corridor, firstRoom), {
      type: 'observe',
      task: firstRoom === 'cabin' ? 'luggage' : 'report',
    });
    const afterFirst = move(first, 'corridor');
    assert.equal(afterFirst.phase, 'onboard');

    const second = progress(move(afterFirst, secondRoom), {
      type: 'observe',
      task: secondRoom === 'cabin' ? 'luggage' : 'report',
    });
    assert.equal(second.phase, 'onboard');
    const hall = move(second, 'corridor');
    assert.equal(hall.phase, 'onboard');
    assert.equal(progress(hall, { type: 'rest-on-deck' }).phase, 'onboard');
    const deck = move(hall, 'deck');
    assert.equal(move(deck, 'corridor').phase, 'onboard');
    const afterBreak = progress(deck, { type: 'rest-on-deck' });
    assert.equal(afterBreak.phase, 'late-deck');
    assert.equal(move(afterBreak, 'corridor').phase, 'sound');
  }
});

test('discovery and the news after arrival precede investigation', () => {
  const corridor: IntroState = {
    ...opening,
    location: 'corridor',
    phase: 'sound',
    luggage: true,
    report: true,
  };
  assert.equal(move(corridor, 'cabin').phase, 'sound');
  const discovery = move(corridor, 'bridge');
  assert.equal(discovery.phase, 'discovery');
  const aftermath = move(discovery, 'corridor');
  assert.equal(aftermath.phase, 'aftermath');
  for (const destination of connections.corridor) {
    assert.equal(move(aftermath, destination).phase, 'investigation');
  }
  const investigation = move(move(aftermath, 'bridge'), 'corridor');
  assert.equal(investigation.phase, 'investigation');
  for (const destination of connections.corridor) {
    assert.deepEqual(move(move(investigation, destination), 'corridor'), investigation);
  }
});

test('the window observation leads to two situated witness accounts and survives revisits', () => {
  const bridge: IntroState = { ...opening, phase: 'investigation', location: 'bridge' };
  assert.equal(progress(bridge, { type: 'ask-cook' }), bridge);
  const observation = progress(bridge, { type: 'record-window' });
  assert.equal(observation.lead, 'light');
  assert.equal(progress(observation, { type: 'ask-cook' }), observation);
  const hall = move(observation, 'corridor');
  const earlyVisit = move(hall, 'cabin');
  assert.equal(progress(earlyVisit, { type: 'ask-engineer' }), earlyVisit);
  const witness = progress(hall, { type: 'ask-cook' });
  assert.equal(witness.lead, 'paper');
  const cabin = move(witness, 'cabin');
  const account = progress(cabin, { type: 'ask-engineer' });
  assert.equal(account.lead, 'engineer');
  const revisit = move(move(account, 'corridor'), 'bridge');
  assert.equal(progress(revisit, { type: 'record-window' }), revisit);
});
