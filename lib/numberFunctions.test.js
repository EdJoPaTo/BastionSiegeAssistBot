import test from 'ava'

const {
  formatNumberShort,
  formatTime
} = require('./numberFunctions')

test('formatNumberShort float', t => {
  t.is(formatNumberShort(1), '1.00')
  t.is(formatNumberShort(10), '10.00')
  t.is(formatNumberShort(100), '100.0')
  t.is(formatNumberShort(1000), '1000')
  t.is(formatNumberShort(10000), '10.00k')
  t.is(formatNumberShort(100000), '100.0k')
  t.is(formatNumberShort(1000000), '1000k')
  t.is(formatNumberShort(10000000), '10.00M')
  t.is(formatNumberShort(100000000), '100.0M')
})

test('formatNumberShort integer', t => {
  t.is(formatNumberShort(1, true), '1')
  t.is(formatNumberShort(10, true), '10')
  t.is(formatNumberShort(100, true), '100')
  t.is(formatNumberShort(1000, true), '1000')
  t.is(formatNumberShort(10000, true), '10.00k')
})

test('formatTime', t => {
  t.is(formatTime(0), '0 min')
  t.is(formatTime(59), '59 min')
  t.is(formatTime(60), '1h')
  t.is(formatTime(61), '1h 1 min')
  t.is(formatTime(23 * 60 + 59), '23h 59 min')
  t.is(formatTime(24 * 60), '1d')
  t.is(formatTime(24 * 60 + 1), '1d 1 min')
})
