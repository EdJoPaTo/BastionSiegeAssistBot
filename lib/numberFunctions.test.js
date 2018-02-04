import test from 'ava'

const {
  formatNumberShort,
  formatTime
} = require('./numberFunctions')

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

test('formatTime', t => {
  t.is(formatTime(0), '0 min')
  t.is(formatTime(59), '59 min')
  t.is(formatTime(60), '1h')
  t.is(formatTime(61), '1h 1 min')
  t.is(formatTime(23 * 60 + 59), '23h 59 min')
  t.is(formatTime(24 * 60), '1d')
  t.is(formatTime(24 * 60 + 1), '1d 1 min')
})

test('formatTime floors minutes', t => {
  t.is(formatTime(1.03), '1 min')
})
