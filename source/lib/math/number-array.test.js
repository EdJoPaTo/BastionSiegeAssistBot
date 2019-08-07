import test from 'ava'

const {
  getSumAverageAmount,
  getSumAverageAmountGroupedBy
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

test('getSumAverageAmountGroupedBy example', t => {
  const input = [
    {key: 'A', value: 1},
    {key: 'B', value: 2},
    {key: 'C', value: 8},
    {key: 'B', value: 4}
  ]

  const result = getSumAverageAmountGroupedBy(input, o => o.key, o => o.value, t)

  t.deepEqual(result.all, {
    amount: 4,
    avg: 3.75,
    min: 1,
    max: 8,
    stdDeviation: 2.680951323690902,
    sum: 15
  })
  t.deepEqual(result.grouped, {
    A: {
      amount: 1,
      avg: 1,
      min: 1,
      max: 1,
      stdDeviation: 0,
      sum: 1
    },
    B: {
      amount: 2,
      avg: 3,
      min: 2,
      max: 4,
      stdDeviation: 1,
      sum: 6
    },
    C: {
      amount: 1,
      avg: 8,
      min: 8,
      max: 8,
      stdDeviation: 0,
      sum: 8
    }
  })
})
