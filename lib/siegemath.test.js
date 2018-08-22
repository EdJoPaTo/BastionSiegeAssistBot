import test from 'ava'

const {
  calcGoldCapacity,
  calcGoldIncome,
  calcProduction,
  calcProductionFood,
  calcStorageCapacity,
  calcStorageLevelNeededForUpgrade,
  calcTownhallLevelNeededForUpgrade,

  calcBuildingCost,
  calcBuildingSemitotalCost,
  calcSemitotalGoldIncome,

  calcMinutesNeededForUpgrade,
  calcMinutesNeededToFillStorage,
  estimateResourcesAfterTimespan
} = require('./siegemath')

test('gold capacity', t => {
  t.is(calcGoldCapacity(1), 500000, 'level 1')
  t.is(calcGoldCapacity(10), 5000000, 'level 10')
  t.is(calcGoldCapacity(100), 50000000, 'level 100')
})

test('gold income', t => {
  t.is(calcGoldIncome(1, 1), 12, 'level 1 1')
  t.is(calcGoldIncome(35, 50), 4000, 'level 35 50')
  t.is(calcGoldIncome(282, 400), 229600, 'level 282 400')
})

test('production', t => {
  t.is(calcProduction(1), 10, 'level 1')
  t.is(calcProduction(10), 100, 'level 10')
  t.is(calcProduction(100), 1000, 'level 100')
})

test('food production', t => {
  t.is(calcProductionFood(1, 1), 0)
  t.is(calcProductionFood(10, 5), 50)
  t.is(calcProductionFood(10, 10), 0)
  t.is(calcProductionFood(100, 500), -4000)
})

test('storage capacity', t => {
  t.is(calcStorageCapacity(1), 1050, 'level 1')
  t.is(calcStorageCapacity(10), 15000, 'level 10')
  t.is(calcStorageCapacity(100), 600000, 'level 100')
})

test('townhall required storage level', t => {
  t.is(calcStorageLevelNeededForUpgrade('townhall', 5), 3)
  t.is(calcStorageLevelNeededForUpgrade('townhall', 10), 8)
  t.is(calcStorageLevelNeededForUpgrade('townhall', 50), 63)
  t.is(calcStorageLevelNeededForUpgrade('townhall', 100), 133)
})

test('trebuchet required townhall level (because of gold capacity)', t => {
  t.is(calcTownhallLevelNeededForUpgrade('trebuchet', 5), 1)
  t.is(calcTownhallLevelNeededForUpgrade('trebuchet', 10), 1)
  t.is(calcTownhallLevelNeededForUpgrade('trebuchet', 50), 21)
  t.is(calcTownhallLevelNeededForUpgrade('trebuchet', 100), 81)
  t.is(calcTownhallLevelNeededForUpgrade('trebuchet', 250), 502)
  t.is(calcTownhallLevelNeededForUpgrade('trebuchet', 350), 983)
  t.is(calcTownhallLevelNeededForUpgrade('trebuchet', 450), 1624)
})

test('townhall upgrade cost', t => {
  t.deepEqual(calcBuildingCost('townhall', 1), { gold: 1500, wood: 600, stone: 600 }, 'level 1')
  t.deepEqual(calcBuildingCost('townhall', 10), { gold: 33000, wood: 13200, stone: 13200 }, 'level 10')
  t.deepEqual(calcBuildingCost('townhall', 100), { gold: 2575500, wood: 1030200, stone: 1030200 }, 'level 100')
})

test('townhall semitotal cost', t => {
  t.is(calcBuildingSemitotalCost('townhall', 1), 3900)
  t.is(calcBuildingSemitotalCost('townhall', 10), 85800)
  t.is(calcBuildingSemitotalCost('townhall', 35), 865800)
})

test('semitotal income', t => {
  t.is(calcSemitotalGoldIncome(1, 1, 1, 1), 52)
  t.is(calcSemitotalGoldIncome(35, 50, 50, 50), 6000)
  t.is(calcSemitotalGoldIncome(282, 400, 100, 100), 233600)
})

test('minutes needed to fill when full', t => {
  const currentResources = { gold: 0, wood: 1050, stone: 1050, food: 1050 }
  const buildings = { townhall: 1, storage: 1, houses: 1, farm: 1, sawmill: 1, mine: 1 }
  t.is(calcMinutesNeededToFillStorage(buildings, currentResources), 0)
})

test('minutes needed to fill when enough gold is there', t => {
  const currentResources = { gold: 500000, wood: 0, stone: 0, food: 0 }
  const buildings = { townhall: 1, storage: 1, houses: 1, farm: 1, sawmill: 1, mine: 1 }
  t.is(calcMinutesNeededToFillStorage(buildings, currentResources), 0)
})

test('minutes needed to fill with only gold income', t => {
  const currentResources = { gold: 0, wood: 1030, stone: 1050, food: 1050 }
  const buildings = { townhall: 1, storage: 1, houses: 1, farm: 1, sawmill: 0, mine: 0 }
  // 20 wood needed -> 40 gold needed to buy it
  // 12 gold per minute -> 4 minutes generate 48 gold -> 48 > 40
  t.is(calcMinutesNeededToFillStorage(buildings, currentResources), 4)
})

test('minutes needed to fill with only ressource income', t => {
  const currentResources = { gold: 0, wood: 1000, stone: 1050, food: 1050 }
  const buildings = { townhall: 0, storage: 1, houses: 0, farm: 0, sawmill: 1, mine: 0 }
  // 50 wood needed, 10 wood per minute -> 5 minutes needed
  t.is(calcMinutesNeededToFillStorage(buildings, currentResources), 5)
})

test('minutes needed to fill when something is full before on its own', t => {
  const currentResources = { gold: 0, wood: 550, stone: 50, food: 1050 }
  const buildings = { townhall: 1, storage: 1, houses: 1, farm: 1, sawmill: 1, mine: 1 }
  // Times per Resource
  // wood alone: 500 needed, 10 per minute -> 50 minutes needed
  // stone alone: 1000 needed, 10 per minute -> 100 minutes
  // 12 gold per minute / 6 resources per minute
  // naive: 1500 needed, 20 + 12/2 = 26 per minute -> 57.69 minutes naive
  // stone with gold: 1000 needed, 10 + 6 = 16 per minute -> 62.5 minutes

  // By the time stone with gold is done wood is already finished
  t.is(calcMinutesNeededToFillStorage(buildings, currentResources), 63)
})

test('minutes needed for upgrade', t => {
  t.is(calcMinutesNeededForUpgrade('townhall', 1, 1, 1, 1, 1, { gold: 0, wood: 0, stone: 0 }), 75, 'townhall 1')
  t.is(calcMinutesNeededForUpgrade('townhall', 35, 35, 50, 50, 50, { gold: 0, wood: 0, stone: 0 }), 145, 'townhall 35')

  // These examples are a bit strange, because its only worthy to buy the missing resources in higher levels.
  // Its just simpler to calc with low levels in the tests
  t.is(calcMinutesNeededForUpgrade('townhall', 1, 1, 1, 1, 1, { gold: 0, wood: 600, stone: 600 }), 125, 'townhall 1 with all resources')
  t.is(calcMinutesNeededForUpgrade('townhall', 1, 1, 1, 1, 1, { gold: 0, wood: 1000, stone: 1000 }), 125, 'townhall 1 with more resources')
  t.is(calcMinutesNeededForUpgrade('townhall', 1, 1, 1, 1, 1, { gold: 3900, wood: 0, stone: 0 }), 0, 'townhall 1 with no resources but enough gold to buy')

  t.is(calcMinutesNeededForUpgrade('townhall', 1, 1, 1, 1, 1, { gold: 1488, wood: 600, stone: 600 }), 1, 'townhall 1 with exact one minute needed')
  t.is(calcMinutesNeededForUpgrade('townhall', 1, 1, 1, 1, 1, { gold: 1490, wood: 600, stone: 600 }), 1, 'townhall 1 with less than one minute needed')
  t.is(calcMinutesNeededForUpgrade('townhall', 1, 1, 1, 1, 1, { gold: 1487, wood: 600, stone: 600 }), 2, 'townhall 1 with a bit more than one minute needed')
})

test('estimate resources start empty without time', t => {
  const currentResources = { gold: 0, wood: 0, stone: 0, food: 0 }

  t.deepEqual(estimateResourcesAfterTimespan(currentResources, 1, 1, 1, 1, 1, 1, 0), currentResources)
})

test('estimate resources start empty with 1 minute time', t => {
  const currentResources = { gold: 0, wood: 0, stone: 0, food: 0 }
  const expected = { gold: 12, wood: 10, stone: 10, food: 0 }

  t.deepEqual(estimateResourcesAfterTimespan(currentResources, 1, 1, 1, 1, 1, 1, 1), expected)
})

test('estimate resources start empty with 5 minute time', t => {
  const currentResources = { gold: 0, wood: 0, stone: 0, food: 0 }
  const expected = { gold: 60, wood: 50, stone: 50, food: 0 }

  t.deepEqual(estimateResourcesAfterTimespan(currentResources, 1, 1, 1, 1, 1, 1, 5), expected)
})

test('estimate resources respect storage limits', t => {
  const currentResources = { gold: 500000, wood: 1050, stone: 1050, food: 1050 }

  t.deepEqual(estimateResourcesAfterTimespan(currentResources, 1, 1, 1, 1, 1, 1, 1), currentResources)
})

test('estimate resources start partly filled with 1 minute time', t => {
  const currentResources = { gold: 1000, wood: 500, stone: 500, food: 500 }
  const expected = { gold: 1012, wood: 510, stone: 510, food: 500 }

  t.deepEqual(estimateResourcesAfterTimespan(currentResources, 1, 1, 1, 1, 1, 1, 1), expected)
})

test('estimate resources start nearly filled with 1 minute time', t => {
  const currentResources = { gold: 499990, wood: 1045, stone: 1045, food: 1045 }
  const expected = { gold: 500000, wood: 1050, stone: 1050, food: 1045 }

  t.deepEqual(estimateResourcesAfterTimespan(currentResources, 1, 1, 1, 1, 1, 1, 1), expected)
})

test('estimate food is not less than 0', t => {
  const currentResources = { gold: 0, wood: 0, stone: 0, food: 0 }

  t.is(estimateResourcesAfterTimespan(currentResources, 35, 1, 50, 1, 1, 1, 1).food, 0)
})

test('estimate loosing food', t => {
  const currentResources = { gold: 0, wood: 0, stone: 0, food: 10000 }

  t.is(estimateResourcesAfterTimespan(currentResources, 1, 491, 500, 1, 1, 100, 1).food, 6000)
})
