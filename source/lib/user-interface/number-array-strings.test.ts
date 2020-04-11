import test from 'ava'

import {
  createAverageMaxString,
  createAverageSumString
} from './number-array-strings'

const testdata = {
  amount: 3,
  avg: 2,
  min: 1,
  max: 3,
  stdDeviation: 0.816496,
  sum: 6
}

test('createAverageMaxString', t => {
  t.is(createAverageMaxString(testdata, 'Test', '€'), 'Test (3): ~2.00€ ≤3.00€')
})

test('createAverageSumString', t => {
  t.is(createAverageSumString(testdata, 'Test', '€'), 'Test (3): ~2.00€ =6.00€')
})
