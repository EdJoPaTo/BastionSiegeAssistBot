import test from 'ava'

const {calcBuildingCost} = require('./siegemath')

test('townhall', t => {
  t.deepEqual(calcBuildingCost('townhall', 1), {gold: 1500, wood: 600, stone: 600}, 'level 1')
  t.deepEqual(calcBuildingCost('townhall', 10), {gold: 33000, wood: 13200, stone: 13200}, 'level 10')
  t.deepEqual(calcBuildingCost('townhall', 100), {gold: 2575500, wood: 1030200, stone: 1030200}, 'level 100')
})
