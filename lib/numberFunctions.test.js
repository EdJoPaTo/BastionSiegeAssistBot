import test from 'ava'

const {
  formatNumberShort
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
