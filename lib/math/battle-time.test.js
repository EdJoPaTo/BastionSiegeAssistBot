import test from 'ava'

import {nextBattleTimestamp} from './battle-time'

test('solo attack 10 min later', t => {
  t.is(nextBattleTimestamp(0).solo, 60 * 10)
})

test('solo attack 10 min after alliance attack', t => {
  t.is(nextBattleTimestamp(0, 60 * 60).solo, 60 * 70)
})

test('solo attack 10 min later ignoring nextAllianceAttack', t => {
  t.is(nextBattleTimestamp(60 * 70, 60 * 60).solo, 60 * 80)
})

test('alliance attack 60 min later', t => {
  t.is(nextBattleTimestamp(0, 0).alliance, 60 * 60)
})

test('alliance attack awaits solo attack', t => {
  t.is(nextBattleTimestamp(60 * 55, 0).alliance, 60 * 65)
})

test('solo attack 5 min with negative karma', t => {
  t.is(nextBattleTimestamp(0, 0, -5).solo, 60 * 5)
})

test('solo attack 5 min after alliance attack with negative karma', t => {
  t.is(nextBattleTimestamp(0, 60 * 60, -5).solo, 60 * 65)
})

test('no solo attack but alliance attack solo', t => {
  t.is(nextBattleTimestamp(undefined, 0).solo, 60 * 10)
})

test('no solo attack but alliance attack alliance', t => {
  t.is(nextBattleTimestamp(undefined, 0).alliance, 60 * 60)
})
