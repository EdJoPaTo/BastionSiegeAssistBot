// gold, wood, stone
const buildingCostFactors = {
  townhall: [250, 100, 100],
  storage: [100, 50, 50],
  houses: [100, 50, 50],
  farm: [50, 25, 25],
  sawmill: [50, 25, 25],
  mine: [50, 25, 25],
  barracks: [100, 50, 50],
  wall: [2500, 250, 750],
  trebuchet: [4000, 500, 150]
}


function calcGoldCapacity(townhallLevel) {
  return 500000 * townhallLevel
}

function calcGoldIncome(townhallLevel, housesLevel) {
  // 0.1 * 20 = 1 * 2
  // return (0.5 + 0.1 * townhallLevel) * housesLevel * 20
  return (5 + townhallLevel) * housesLevel * 2
}

function calcProduction(productionBuildingLevel) {
  return 10 * productionBuildingLevel
}

function calcStorageCapacity(storageLevel) {
  return 50 * storageLevel * (storageLevel + 20)
}


function calcBuildingCost(building, currentBuildingLevel) {
  return {
    gold: buildingCostFactors[building][0] * (currentBuildingLevel + 1) * (currentBuildingLevel + 2),
    wood: buildingCostFactors[building][1] * (currentBuildingLevel + 1) * (currentBuildingLevel + 2),
    stone: buildingCostFactors[building][2] * (currentBuildingLevel + 1) * (currentBuildingLevel + 2)
  }
}

// Semitotal Gold is the amount of gold needed in order to buy everything.
// Gold is much fast to get and buy the resources with it than the buildings gather them
// so this will be kinda wrong on low levels were you could sell resources in order to get gold
function calcBuildingSemitotalCost(building, currentBuildingLevel) {
  const cost = calcBuildingCost(building, currentBuildingLevel)
  return calcSemitotalGold(cost.gold, cost.wood, cost.stone)
}

function calcSemitotalGold(gold, wood, stone) {
  return gold + wood * 2 + stone * 2
}

function calcSemitotalGoldIncome(townhallLevel, housesLevel, sawmillLevel, mineLevel) {
  return calcGoldIncome(townhallLevel, housesLevel) + calcProduction(sawmillLevel) * 2 + calcProduction(mineLevel) * 2
}

function calcMinutesNeeded(cost, townhallLevel, housesLevel, sawmillLevel, mineLevel, currentGold, currentWood, currentStone) {
  const goldNeeded = cost.gold - currentGold
  const woodNeeded = Math.max(0, cost.wood - currentWood)
  const stoneNeeded = Math.max(0, cost.stone - currentStone)

  const semitotalNeeded = Math.max(0, calcSemitotalGold(goldNeeded, woodNeeded, stoneNeeded))

  const income = calcSemitotalGoldIncome(townhallLevel, housesLevel, woodNeeded === 0 ? 0 : sawmillLevel, stoneNeeded === 0 ? 0 : mineLevel)

  return Math.ceil(semitotalNeeded / income)
}

function calcMinutesNeededForUpgrade(building, currentBuildingLevel, townhallLevel, housesLevel, sawmillLevel, mineLevel, currentGold, currentWood, currentStone) {
  const cost = calcBuildingCost(building, currentBuildingLevel)
  return calcMinutesNeeded(cost, townhallLevel, housesLevel, sawmillLevel, mineLevel, currentGold, currentWood, currentStone)
}


module.exports = {
  calcGoldCapacity: calcGoldCapacity,
  calcGoldIncome: calcGoldIncome,
  calcProduction: calcProduction,
  calcStorageCapacity: calcStorageCapacity,

  calcBuildingCost: calcBuildingCost,
  calcBuildingSemitotalCost: calcBuildingSemitotalCost,
  calcSemitotalGoldIncome: calcSemitotalGoldIncome,

  calcMinutesNeeded: calcMinutesNeeded,
  calcMinutesNeededForUpgrade: calcMinutesNeededForUpgrade
}
