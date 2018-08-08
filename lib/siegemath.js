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

function calcProductionFood(farmLevel, housesLevel) {
  // return calcProduction(farmLevel) - housesLevel * 20 / 2
  return (farmLevel - housesLevel) * 10
}

function calcStorageCapacity(storageLevel) {
  return 50 * storageLevel * (storageLevel + 20)
}

function calcStorageLevelNeededForUpgrade(building, wantedBuildingLevel) {
  const maxResourceFactor = Math.max(buildingCostFactors[building][1], buildingCostFactors[building][2])
  const resourceLimitNeeded = maxResourceFactor * wantedBuildingLevel * (wantedBuildingLevel + 1)

  const tmp1 = Math.sqrt(2)
  const tmp2 = Math.sqrt(resourceLimitNeeded + 5000)
  const tmp3 = tmp1 * tmp2 - 100
  const tmp4 = tmp3 / 10
  const levelRequired = Math.ceil(tmp4)

  return levelRequired
}

function calcTownhallLevelNeededForUpgrade(building, wantedBuildingLevel) {
  const goldFactor = buildingCostFactors[building][0]
  const resourceLimitNeeded = goldFactor * wantedBuildingLevel * (wantedBuildingLevel + 1)

  const tmp1 = resourceLimitNeeded / 500000
  const levelRequired = Math.ceil(tmp1)
  return levelRequired
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

function calcMinutesNeeded(cost, townhallLevel, housesLevel, sawmillLevel, mineLevel, currentResources) {
  const goldNeeded = cost.gold - currentResources.gold
  const woodNeeded = Math.max(0, cost.wood - currentResources.wood)
  const stoneNeeded = Math.max(0, cost.stone - currentResources.stone)

  const semitotalNeeded = Math.max(0, calcSemitotalGold(goldNeeded, woodNeeded, stoneNeeded))

  const income = calcSemitotalGoldIncome(townhallLevel, housesLevel, woodNeeded === 0 ? 0 : sawmillLevel, stoneNeeded === 0 ? 0 : mineLevel)

  return Math.ceil(semitotalNeeded / income)
}

function calcMinutesNeededForUpgrade(building, currentBuildingLevel, townhallLevel, housesLevel, sawmillLevel, mineLevel, currentResources) {
  const cost = calcBuildingCost(building, currentBuildingLevel)
  return calcMinutesNeeded(cost, townhallLevel, housesLevel, sawmillLevel, mineLevel, currentResources)
}

function calcMinutesNeededToFillStorage(buildings, currentResources) {
  const storageSize = calcStorageCapacity(buildings.storage)
  const woodNeeded = storageSize - currentResources.wood
  const stoneNeeded = storageSize - currentResources.stone
  const foodNeeded = storageSize - currentResources.food

  const goldIncome = calcGoldIncome(buildings.townhall, buildings.houses)
  const woodIncome = calcProduction(buildings.sawmill)
  const stoneIncome = calcProduction(buildings.mine)
  const foodIncome = calcProductionFood(buildings.farm, buildings.houses)

  const onlyWoodNeededMinutes = woodNeeded / woodIncome
  const onlyStoneNeededMinutes = stoneNeeded / stoneIncome
  const onlyFoodNeededMinutes = foodNeeded / foodIncome

  let combinedNeedFirstApprox = woodNeeded + stoneNeeded + foodNeeded - currentResources.gold / 2
  combinedNeedFirstApprox = Math.max(0, combinedNeedFirstApprox)
  const combinedIncomeFirstApprox = woodIncome + stoneIncome + foodIncome + goldIncome / 2
  const combinedMinutesNeededFirstApprox = Math.ceil(combinedNeedFirstApprox / combinedIncomeFirstApprox)

  let combinedNeed = -currentResources.gold / 2
  let combinedIncome = goldIncome / 2

  if (onlyWoodNeededMinutes >= combinedMinutesNeededFirstApprox) {
    combinedNeed += woodNeeded
    combinedIncome += woodIncome
  }

  if (onlyStoneNeededMinutes >= combinedMinutesNeededFirstApprox) {
    combinedNeed += stoneNeeded
    combinedIncome += stoneIncome
  }

  if (foodIncome <= 0 ||
      onlyFoodNeededMinutes >= combinedMinutesNeededFirstApprox) {
    combinedNeed += foodNeeded
    combinedIncome += foodIncome
  }

  combinedNeed = Math.max(0, combinedNeed)
  const minutesNeeded = Math.ceil(combinedNeed / combinedIncome)

  return minutesNeeded
}


function estimateResourcesAfterTimespan(currentResources, townhallLevel, storageLevel, housesLevel, sawmillLevel, mineLevel, farmLevel, minutes) {
  const goldIncome = calcGoldIncome(townhallLevel, housesLevel)
  const woodIncome = calcProduction(sawmillLevel)
  const stoneIncome = calcProduction(mineLevel)
  const foodIncome = calcProductionFood(farmLevel, housesLevel)

  const goldLimit = calcGoldCapacity(townhallLevel)
  const storageLimit = calcStorageCapacity(storageLevel)

  const estimated = {
    gold: currentResources.gold + goldIncome * minutes,
    wood: currentResources.wood + woodIncome * minutes,
    stone: currentResources.stone + stoneIncome * minutes,
    food: currentResources.food + foodIncome * minutes
  }

  const estimatedWithLimits = {
    gold: Math.min(goldLimit, estimated.gold),
    wood: Math.min(storageLimit, estimated.wood),
    stone: Math.min(storageLimit, estimated.stone),
    food: Math.min(storageLimit, Math.max(0, estimated.food))
  }

  return estimatedWithLimits
}


module.exports = {
  calcGoldCapacity: calcGoldCapacity,
  calcGoldIncome: calcGoldIncome,
  calcProduction: calcProduction,
  calcProductionFood: calcProductionFood,
  calcStorageCapacity: calcStorageCapacity,
  calcStorageLevelNeededForUpgrade: calcStorageLevelNeededForUpgrade,
  calcTownhallLevelNeededForUpgrade: calcTownhallLevelNeededForUpgrade,

  calcBuildingCost: calcBuildingCost,
  calcBuildingSemitotalCost: calcBuildingSemitotalCost,
  calcSemitotalGoldIncome: calcSemitotalGoldIncome,

  calcMinutesNeeded: calcMinutesNeeded,
  calcMinutesNeededForUpgrade: calcMinutesNeededForUpgrade,
  calcMinutesNeededToFillStorage: calcMinutesNeededToFillStorage,
  estimateResourcesAfterTimespan: estimateResourcesAfterTimespan
}
