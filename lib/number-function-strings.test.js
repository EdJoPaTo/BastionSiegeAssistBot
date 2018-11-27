import test from 'ava'

const {
  createAmountAverageDeviationString,
  createSumAverageAmountString
} = require('./number-function-strings')

const testdata = {
  amount: 3,
  avg: 2,
  min: 1,
  max: 3,
  stdDeviation: 0.816496,
  sum: 6
}

test('createSumAverageAmountString isInteger', t => {
  t.is(createSumAverageAmountString(testdata, 'Test', '€', true), 'Test (3): ~2.00€ ≥1€ ≤3€ =6€')
})

test('createSumAverageAmountString !isInteger', t => {
  t.is(createSumAverageAmountString(testdata, 'Test', '€', false), 'Test (3): ~2.00€ ≥1.00€ ≤3.00€ =6.00€')
})

test('createAmountAverageDeviationString', t => {
  t.is(createAmountAverageDeviationString(testdata, 'Test', '€'), 'Test (3): ~2.00€ ±0.82€')
})

test('createAmountAverageDeviationString no entries', t => {
  const data = {
    amount: 0
  }
  t.is(createAmountAverageDeviationString(data, 'Test', '€'), 'Test (0)')
})

test('createAmountAverageDeviationString one entry', t => {
  const data = {
    amount: 1,
    avg: 2,
    min: 2,
    max: 2,
    sum: 2
  }
  t.is(createAmountAverageDeviationString(data, 'Test', '€'), 'Test (1): 2.00€')
})
