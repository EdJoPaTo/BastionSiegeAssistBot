import test from 'ava'

const {
  calcBuildingCost,
  calcWallRepairCost,
  calcBuildingCostUntil
} = require('./siegemath')

test('townhall', t => {
  t.deepEqual(calcBuildingCost('townhall', 1), {gold: 1500, wood: 600, stone: 600}, 'level 1')
  t.deepEqual(calcBuildingCost('townhall', 10), {gold: 33000, wood: 13200, stone: 13200}, 'level 10')
  t.deepEqual(calcBuildingCost('townhall', 100), {gold: 2575500, wood: 1030200, stone: 1030200}, 'level 100')

  t.deepEqual(calcBuildingCost('townhall', 593), {gold: 88357500, wood: 35343000, stone: 35343000}, 'level 593')
})

test('townhall until', t => {
  t.deepEqual(calcBuildingCostUntil('townhall', 1, 2), {gold: 1500, wood: 600, stone: 600}, 'level 1 till 2')
  t.deepEqual(calcBuildingCostUntil('townhall', 1, 10), {gold: 109500, wood: 43800, stone: 43800}, 'level 1 till 10')
})

test('trebuchet', t => {
  t.deepEqual(calcBuildingCost('trebuchet', 1), {gold: 24000, wood: 3000, stone: 900}, 'level 1')
  t.deepEqual(calcBuildingCost('trebuchet', 10), {gold: 528000, wood: 66000, stone: 19800}, 'level 10')
  t.deepEqual(calcBuildingCost('trebuchet', 100), {gold: 41208000, wood: 5151000, stone: 1545300}, 'level 100')

  t.deepEqual(calcBuildingCost('trebuchet', 21), {gold: 2024000, wood: 253000, stone: 75900}, 'level 22')
})

test('ballista', t => {
  t.deepEqual(calcBuildingCost('ballista', 0), {gold: 10000, wood: 700, stone: 100}, 'level 0')
  t.deepEqual(calcBuildingCost('ballista', 1), {gold: 30000, wood: 2100, stone: 300}, 'level 1')
  t.deepEqual(calcBuildingCost('ballista', 2), {gold: 60000, wood: 4200, stone: 600}, 'level 2')
  t.deepEqual(calcBuildingCost('ballista', 7), {gold: 360000, wood: 25200, stone: 3600}, 'level 7')
})

test('wall', t => {
  t.deepEqual(calcBuildingCost('wall', 1), {gold: 15000, wood: 1500, stone: 4500}, 'level 1')
  t.deepEqual(calcBuildingCost('wall', 10), {gold: 330000, wood: 33000, stone: 99000}, 'level 10')
  t.deepEqual(calcBuildingCost('wall', 100), {gold: 25755000, wood: 2575500, stone: 7726500}, 'level 100')
})

test('wall repair', t => {
  t.deepEqual(calcWallRepairCost(1), {gold: 1500, wood: 150, stone: 450}, 'level 1')
  t.deepEqual(calcWallRepairCost(10), {gold: 33000, wood: 3300, stone: 9900}, 'level 10')
  t.deepEqual(calcWallRepairCost(100), {gold: 2575500, wood: 257550, stone: 772650}, 'level 100')
})
