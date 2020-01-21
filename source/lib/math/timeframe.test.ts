import test from 'ava'

import {
  MINUTE_IN_SECONDS,
  HOUR_IN_SECONDS,
  DAY_IN_SECONDS,
  calculateSecondsFromTimeframeString
} from './timeframe'

test('constants correct', t => {
  t.is(MINUTE_IN_SECONDS, 60)
  t.is(HOUR_IN_SECONDS, 60 * 60)
  t.is(DAY_IN_SECONDS, 60 * 60 * 24)
})

test('calculateSecondsFromTimeframeString examples', t => {
  t.is(calculateSecondsFromTimeframeString('2min'), 2 * MINUTE_IN_SECONDS)
  t.is(calculateSecondsFromTimeframeString('2h'), 2 * HOUR_IN_SECONDS)
  t.is(calculateSecondsFromTimeframeString('2d'), 2 * DAY_IN_SECONDS)

  t.is(calculateSecondsFromTimeframeString('2 min'), 2 * MINUTE_IN_SECONDS)
  t.is(calculateSecondsFromTimeframeString('2 h'), 2 * HOUR_IN_SECONDS)
  t.is(calculateSecondsFromTimeframeString('2 d'), 2 * DAY_IN_SECONDS)
})

test('calculateSecondsFromTimeframeString undefined unit', t => {
  t.throws(() => {
    calculateSecondsFromTimeframeString('7f')
  }, {
    message: 'unknown unit'
  })
})
