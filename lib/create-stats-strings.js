const {emoji} = require('../lib/gamescreen')
const {formatNumberShort, formatTime} = require('../lib/number-functions')
const {calcGoldCapacity, calcGoldIncome, calcBuildingCost, calcProduction, calcProductionFood, calcStorageCapacity, calcStorageLevelNeededForUpgrade, calcTownhallLevelNeededForUpgrade, calcMinutesNeeded, calcMinutesNeededToFillStorage, estimateResourcesAfterTimespan} = require('../lib/siegemath')

function createBuildingTimeStatsString(buildingName, buildings, resources) {
  let text = ''

  text += emoji[buildingName] + ' '
  if (!buildings[buildingName]) {
    text += `⚠️ unknown ${buildingName} level`
    return text
  }

  const storageCapacity = calcStorageCapacity(buildings.storage)
  const cost = calcBuildingCost(buildingName, buildings[buildingName])
  if (cost.wood > storageCapacity || cost.stone > storageCapacity) {
    text += `⚠️ storage level ${calcStorageLevelNeededForUpgrade(buildingName, buildings[buildingName] + 1)} needed`
    return text
  }

  const goldCapacity = calcGoldCapacity(buildings.townhall)
  if (cost.gold > goldCapacity) {
    text += `⚠️ townhall (gold capacity) level ${calcTownhallLevelNeededForUpgrade(buildingName, buildings[buildingName] + 1)} needed`
    return text
  }

  const minutesNeeded = calcMinutesNeeded(cost, buildings, resources)
  if (minutesNeeded === 0) {
    text += '✅'
  } else {
    text += `${formatTime(minutesNeeded)}`
  }

  const neededMaterialString = createNeededMaterialStatString(cost, resources)
  if (neededMaterialString.length > 0) {
    text += ` ${neededMaterialString}`
  }
  return text
}

function createFillTimeStatsString(buildings, resources) {
  let text = ''

  const goldCapacity = calcGoldCapacity(buildings.townhall)
  const storageCapacity = calcStorageCapacity(buildings.storage)

  const goldFillTimeNeeded = (goldCapacity - resources.gold) / calcGoldIncome(buildings.townhall, buildings.houses)
  const woodFillTimeNeeded = (storageCapacity - resources.wood) / calcProduction(buildings.sawmill)
  const stoneFillTimeNeeded = (storageCapacity - resources.stone) / calcProduction(buildings.mine)
  const foodProduction = calcProductionFood(buildings.farm, buildings.houses)

  const minutesNeededToFillStorage = calcMinutesNeededToFillStorage(buildings, resources)
  const estimatedRessourcedWhenFillAvailable = estimateResourcesAfterTimespan(resources, buildings, minutesNeededToFillStorage)

  text += `${emoji.gold} full in ${formatTime(goldFillTimeNeeded)} (${formatNumberShort(goldCapacity - resources.gold, true)}${emoji.gold})\n`
  text += `${emoji.wood} full in ${formatTime(woodFillTimeNeeded)} (${formatNumberShort(storageCapacity - resources.wood, true)}${emoji.wood})\n`
  text += `${emoji.stone} full in ${formatTime(stoneFillTimeNeeded)} (${formatNumberShort(storageCapacity - resources.stone, true)}${emoji.stone})\n`

  if (foodProduction > 0) {
    const foodFillTimeNeeded = (storageCapacity - resources.food) / calcProduction(buildings.mine)
    text += `${emoji.food} full in ${formatTime(foodFillTimeNeeded)} (${formatNumberShort(storageCapacity - resources.food, true)}${emoji.food})\n`
  } else if (foodProduction < 0) {
    const foodEmptyTimeNeeded = resources.food / -foodProduction
    text += `${emoji.food} fill with ${formatNumberShort(storageCapacity - resources.food, true)}${emoji.food}\n`
    text += `${emoji.food} empty in ${formatTime(foodEmptyTimeNeeded)} (${formatNumberShort(resources.food, true)}${emoji.food})\n`
  }

  text += '\n'
  text += `${emoji.storage} fill in ${formatTime(minutesNeededToFillStorage)} (${formatNumberShort(estimatedRessourcedWhenFillAvailable.gold - resources.gold, true)}${emoji.gold})\n`

  return text
}

function createNeededMaterialStatString(cost, currentResources) {
  const goldNeeded = cost.gold - currentResources.gold
  const woodNeeded = cost.wood - currentResources.wood
  const stoneNeeded = cost.stone - currentResources.stone
  const foodNeeded = cost.food - currentResources.food

  const neededMaterial = []
  if (goldNeeded > 0) {
    neededMaterial.push(`${formatNumberShort(goldNeeded, true)}${emoji.gold}`)
  }
  if (woodNeeded > 0) {
    neededMaterial.push(`${formatNumberShort(woodNeeded, true)}${emoji.wood}`)
  }
  if (stoneNeeded > 0) {
    neededMaterial.push(`${formatNumberShort(stoneNeeded, true)}${emoji.stone}`)
  }
  if (foodNeeded > 0) {
    neededMaterial.push(`${formatNumberShort(foodNeeded, true)}${emoji.food}`)
  }
  return neededMaterial.join(' ')
}

module.exports = {
  createBuildingTimeStatsString,
  createFillTimeStatsString,
  createNeededMaterialStatString
}
