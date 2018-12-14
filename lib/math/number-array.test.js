import test from 'ava'

const {
  getSumAverageAmount
} = require('./number-array')

test('getSumAverageAmount', t => {
  t.deepEqual(getSumAverageAmount([1, 2, 3]), {
    amount: 3,
    avg: 2,
    min: 1,
    max: 3,
    stdDeviation: 0.816496580927726,
    sum: 6
  })
})

test('getSumAverageAmount empty', t => {
  t.deepEqual(getSumAverageAmount([]), {
    amount: 0,
    avg: NaN,
    min: Infinity,
    max: -Infinity,
    stdDeviation: NaN,
    sum: 0
  })
})

test('getSumAverageAmount null as value is ignored', t => {
  t.deepEqual(getSumAverageAmount([null]), {
    amount: 0,
    avg: NaN,
    min: Infinity,
    max: -Infinity,
    stdDeviation: NaN,
    sum: 0
  })
})
