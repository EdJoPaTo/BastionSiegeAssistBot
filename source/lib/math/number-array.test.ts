import test from 'ava'

import {
  getSumAverageAmount,
  getSumAverageAmountGroupedBy
} from './number-array'

test('getSumAverageAmount', t => {
  t.deepEqual(getSumAverageAmount([1, 2, 3]), {
    amount: 3,
    avg: 2,
    min: 1,
    max: 3,
    sum: 6
  })
})

test('getSumAverageAmount empty', t => {
  t.deepEqual(getSumAverageAmount([]), {
    amount: 0,
    avg: Number.NaN,
    min: Infinity,
    max: -Infinity,
    sum: 0
  })
})

test('getSumAverageAmount null as value is ignored', t => {
  t.deepEqual(getSumAverageAmount([null]), {
    amount: 0,
    avg: Number.NaN,
    min: Infinity,
    max: -Infinity,
    sum: 0
  })
})

test('getSumAverageAmount 0 is still averaged', t => {
  t.deepEqual(getSumAverageAmount([0, 2]), {
    amount: 2,
    avg: 1,
    min: 0,
    max: 2,
    sum: 2
  })
})

test('getSumAverageAmountGroupedBy example', t => {
  const input = [
    {key: 'A', value: 1},
    {key: 'B', value: 2},
    {key: 'C', value: 8},
    {key: 'B', value: 4}
  ]

  const result = getSumAverageAmountGroupedBy(input, o => o.key, o => o.value)

  t.deepEqual(result.all, {
    amount: 4,
    avg: 3.75,
    min: 1,
    max: 8,
    sum: 15
  })
  t.deepEqual(result.grouped, {
    A: {
      amount: 1,
      avg: 1,
      min: 1,
      max: 1,
      sum: 1
    },
    B: {
      amount: 2,
      avg: 3,
      min: 2,
      max: 4,
      sum: 6
    },
    C: {
      amount: 1,
      avg: 8,
      min: 8,
      max: 8,
      sum: 8
    }
  })
})
