import test from 'ava'

const {calcBuildingCost} = require('./siegemath')

test('townhall', t => {
  t.deepEqual(calcBuildingCost('townhall', 1), {gold: 1500, wood: 600, stone: 600}, 'level 1')
  t.deepEqual(calcBuildingCost('townhall', 10), {gold: 33000, wood: 13200, stone: 13200}, 'level 10')
  t.deepEqual(calcBuildingCost('townhall', 100), {gold: 2575500, wood: 1030200, stone: 1030200}, 'level 100')

  t.deepEqual(calcBuildingCost('townhall', 593), {gold: 88357500, wood: 35343000, stone: 35343000}, 'level 593')
})

test('trebuchet', t => {
  t.deepEqual(calcBuildingCost('trebuchet', 1), {gold: 24000, wood: 3000, stone: 900}, 'level 1')
  t.deepEqual(calcBuildingCost('trebuchet', 10), {gold: 528000, wood: 66000, stone: 19800}, 'level 10')
  t.deepEqual(calcBuildingCost('trebuchet', 100), {gold: 41208000, wood: 5151000, stone: 1545300}, 'level 100')

  t.deepEqual(calcBuildingCost('trebuchet', 21), {gold: 2024000, wood: 253000, stone: 75900}, 'level 22')
})
