import test from 'ava'

const {
  getMidnightXDaysEarlier
} = require('./unix-timestamp')

test('getMidnightXDaysEarlier example', t => {
  t.is(getMidnightXDaysEarlier(1542913295, 7), 1542326400)
})
