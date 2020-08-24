import test from 'ava'

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {}

import {
  createAlertAtTimestamp
} from './alert'

test('alert in future is returned', t => {
  const result = createAlertAtTimestamp(5000, noop, 0)
  t.truthy(result)
  if (result) {
    clearTimeout(result)
  }
})

test('alert in past is not created', t => {
  const result = createAlertAtTimestamp(0, noop, 500)
  t.falsy(result)
})

test('alert at timestamp NaN is not created', t => {
  const result = createAlertAtTimestamp(Number.NaN, noop, 0)
  t.falsy(result)
})

test.cb('alert func is called', t => {
  createAlertAtTimestamp(50, () => {
    t.pass()
    t.end()
  }, 0)
})
