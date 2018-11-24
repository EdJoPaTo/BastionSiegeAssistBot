import test from 'ava'

const {
  emoji,
  createNeededMaterialStatString,
  createSumAverageAmountString
} = require('./create-stats-strings')

test('needed material string only gold', t => {
  const cost = {gold: 100}
  const resources = {gold: 0}

  t.is(createNeededMaterialStatString(cost, resources), `100${emoji.gold}`)
})

test('needed material string only some gold', t => {
  const cost = {gold: 100}
  const resources = {gold: 50}

  t.is(createNeededMaterialStatString(cost, resources), `50${emoji.gold}`)
})

test('needed material string gold and stone', t => {
  const cost = {gold: 100, stone: 200}
  const resources = {gold: 0, stone: 0}

  t.is(createNeededMaterialStatString(cost, resources), `100${emoji.gold} 200${emoji.stone}`)
})

test('needed material everything', t => {
  const cost = {gold: 100, wood: 300, stone: 200, food: 400}
  const resources = {gold: 0, wood: 0, stone: 0, food: 0}

  t.is(createNeededMaterialStatString(cost, resources), `100${emoji.gold} 300${emoji.wood} 200${emoji.stone} 400${emoji.food}`)
})

// € is a bad example as createSumAverageAmountString assumes the values are Integer, not floats
test('createSumAverageAmountString', t => {
  const data = {
    amount: 3,
    avg: 2,
    min: 1,
    max: 3,
    sum: 6
  }
  t.is(createSumAverageAmountString(data, 'Test', '€'), 'Test (3): ~2.00€ (Min: 1€; Max: 3€; Total: 6€)')
})

test('createSumAverageAmountString no entries', t => {
  const data = {
    amount: 0
  }
  t.is(createSumAverageAmountString(data, 'Test', '€'), 'Test (0)')
})

test('createSumAverageAmountString one entry', t => {
  const data = {
    amount: 1,
    avg: 2,
    min: 2,
    max: 2,
    sum: 2
  }
  t.is(createSumAverageAmountString(data, 'Test', '€'), 'Test (1): 2€')
})
