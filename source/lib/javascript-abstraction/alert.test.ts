import test from 'ava'

import {
  createAlertAtTimestamp
} from './alert'

test('alert in future is returned', t => {
  const result = createAlertAtTimestamp(5000, () => {}, 0)
  t.truthy(result)
  if (result) {
    clearTimeout(result)
  }
})

test('alert in past is not created', t => {
  const result = createAlertAtTimestamp(0, () => {}, 500)
  t.falsy(result)
})

test('alert at timestamp NaN is not created', t => {
  const result = createAlertAtTimestamp(NaN, () => {}, 0)
  t.falsy(result)
})

test.cb('alert func is called', t => {
  createAlertAtTimestamp(50, () => {
    t.pass()
    t.end()
  }, 0)
})
