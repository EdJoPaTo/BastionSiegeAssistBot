import test from 'ava'

const {
  formatNumberShort,
  formatTime,
  formatTimeFrame,
  formatTimeAmount
} = require('./format-number')

test('formatNumberShort float', t => {
  t.is(formatNumberShort(0), '0.00')
  t.is(formatNumberShort(1), '1.00')
  t.is(formatNumberShort(10), '10.0')
  t.is(formatNumberShort(50), '50.0')
  t.is(formatNumberShort(100), '100')
  t.is(formatNumberShort(999.4), '999')
  t.is(formatNumberShort(1000), '1.00k')
  t.is(formatNumberShort(10000), '10.0k')
  t.is(formatNumberShort(100000), '100k')
  t.is(formatNumberShort(1000000), '1.00M')
  t.is(formatNumberShort(10000000), '10.0M')
  t.is(formatNumberShort(100000000), '100M')
})

test('formatNumberShort integer', t => {
  t.is(formatNumberShort(0, true), '0')
  t.is(formatNumberShort(0.1, true), '0')
  t.is(formatNumberShort(1, true), '1')
  t.is(formatNumberShort(10, true), '10')
  t.is(formatNumberShort(100, true), '100')
  t.is(formatNumberShort(1000, true), '1.00k')
  t.is(formatNumberShort(10000, true), '10.0k')
})

test('formatNumberShort negative', t => {
  t.is(formatNumberShort(-1, true), '-1')
  t.is(formatNumberShort(-100, true), '-100')
  t.is(formatNumberShort(-10000, true), '-10.0k')
})

test('formatNumberShort NaN', t => {
  t.is(formatNumberShort(undefined), 'NaN')
  t.is(formatNumberShort(null), 'NaN')
})

test('formatTime', t => {
  t.is(formatTime(0), '0:00')
  t.is(formatTime(60), '0:01')
  t.is(formatTime(58 * 60), '0:58')
  t.is(formatTime(60 * 60), '1:00')
  t.is(formatTime((60 * 60) + (2 * 60)), '1:02')
  t.is(formatTime((3 * 60 * 60) + (2 * 60)), '3:02')

  t.is(formatTime(0, true), '0:00:00')
  t.is(formatTime(4, true), '0:00:04')
  t.is(formatTime(42, true), '0:00:42')
  t.is(formatTime(60, true), '0:01:00')
  t.is(formatTime((3 * 60 * 60) + (2 * 60) + 4, true), '3:02:04')
})

test('formatTimeFrame', t => {
  t.is(formatTimeFrame({
    seconds: 60 * 60 * 2,
    stdDeviation: 0
  }), '2:00')
  t.is(formatTimeFrame({
    seconds: 60 * 60 * 2,
    stdDeviation: 60 * 60
  }), '1:00 - 3:00')
})

test('formatTimeAmount', t => {
  t.is(formatTimeAmount(0), '0 min')
  t.is(formatTimeAmount(59), '59 min')
  t.is(formatTimeAmount(60), '1h')
  t.is(formatTimeAmount(61), '1h 1 min')
  t.is(formatTimeAmount((23 * 60) + 59), '23h 59 min')
  t.is(formatTimeAmount((24 * 60)), '1d')
  t.is(formatTimeAmount((24 * 60) + 1), '1d 1 min')
  t.is(formatTimeAmount((24 * 60) + (2 * 60) + 1), '1d 2h')
  t.is(formatTimeAmount((40 * 24 * 60) + (2 * 60) + 1), '40d 2h')
})

test('formatTimeAmount floors minutes', t => {
  t.is(formatTimeAmount(1.03), '1 min')
})
