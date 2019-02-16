const {formatNumberShort, formatTimeAmount} = require('../user-interface/format-number')
const {
  BATTLE_ODDS,
  calcGoldCapacity,
  calcGoldIncome,
  calcBuildingCost,
  calcBuildingCostUntil,
  calcBuildingCostPerWinchance,
  calcSemitotalGold,
  calcProduction,
  calcProductionFood,
  calcStorageCapacity,
  calcStorageLevelNeededForUpgrade,
  calcTownhallLevelNeededForUpgrade,
  calcMaxBuildingLevel,
  calcMinutesNeeded,
  calcMinutesNeededToFillStorage,
  estimateResourcesAfterTimespan
} = require('../math/siegemath')

const {emoji} = require('./output-text')

const BUILDINGS = [
  'townhall',
  'storage',
  'houses',
  'farm',
  'sawmill',
  'mine',
  'barracks',
  'wall',
  'trebuchet',
  'ballista'
]

const defaultBuildingsToShow = ['townhall', 'storage', 'houses', 'mine', 'barracks', 'wall', 'trebuchet', 'ballista']

function getBuildingText(ctx, building) {
  return emoji[building] + ' ' + ctx.i18n.t('bs.building.' + building)
}

function createBuildingCostPerWinChanceLine(battleType, buildingName, currentLevel) {
  const odds = BATTLE_ODDS[battleType][buildingName]
  const buildingLevelsRequired = 1 / odds

  const total = calcBuildingCostPerWinchance(battleType, buildingName, currentLevel)
  const semitotal = calcSemitotalGold(total)

  let text = emoji[buildingName]
  text += ' '
  text += '+' + formatNumberShort(buildingLevelsRequired)
  text += ': '
  text += formatNumberShort(semitotal, true) + emoji.gold

  return text
}

function createBuildingSemitotalLine(buildingName, resourceCost) {
  const semitotal = calcSemitotalGold(resourceCost)

  let text = emoji[buildingName] + ' '
  text += formatNumberShort(semitotal) + emoji.gold
  return text
}

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
    const minStorage = calcStorageLevelNeededForUpgrade(buildingName, buildings[buildingName] + 1)
    const storageDiff = minStorage - buildings.storage
    text += `⚠️ storage +${storageDiff} needed`
    return text
  }

  const goldCapacity = calcGoldCapacity(buildings.townhall)
  if (cost.gold > goldCapacity) {
    const minTownhall = calcTownhallLevelNeededForUpgrade(buildingName, buildings[buildingName] + 1)
    const townhallDiff = minTownhall - buildings.townhall
    text += `⚠️ townhall (gold capacity) +${townhallDiff} needed`
    return text
  }

  const minutesNeeded = calcMinutesNeeded(cost, buildings, resources)
  if (minutesNeeded === 0) {
    text += '✅'
  } else {
    text += `${formatTimeAmount(minutesNeeded)}`
  }

  const neededMaterialString = createNeededMaterialStatString(cost, resources)
  if (neededMaterialString.length > 0) {
    text += ` ${neededMaterialString}`
  }

  return text
}

function createBuildingMaxLevelStatsString(buildingName, buildings, resources) {
  const currentBuildingLevel = buildings[buildingName]

  let text = emoji[buildingName] + ' '
  if (!currentBuildingLevel) {
    text += `⚠️ unknown ${buildingName} level`
    return text
  }

  const maxLevel = calcMaxBuildingLevel(buildingName, buildings)
  const cost = calcBuildingCostUntil(buildingName, currentBuildingLevel, maxLevel)
  const minutesNeeded = calcMinutesNeeded(cost, buildings, resources)

  if (currentBuildingLevel >= maxLevel) {
    text += 'max'
    return text
  }

  const difference = maxLevel - currentBuildingLevel

  text += '+' + difference
  text += ': '
  text += formatTimeAmount(minutesNeeded)

  return text
}

function createFillTimeStatsString(buildings, resources) {
  let text = ''

  const goldCapacity = calcGoldCapacity(buildings.townhall)
  const storageCapacity = calcStorageCapacity(buildings.storage)

  const goldProduction = calcGoldIncome(buildings.townhall, buildings.houses)
  const goldFillTimeNeeded = (goldCapacity - resources.gold) / goldProduction
  const woodFillTimeNeeded = (storageCapacity - resources.wood) / calcProduction(buildings.sawmill)
  const stoneFillTimeNeeded = (storageCapacity - resources.stone) / calcProduction(buildings.mine)
  const foodProduction = calcProductionFood(buildings.farm, buildings.houses)

  const minutesNeededToFillStorage = calcMinutesNeededToFillStorage(buildings, resources)
  const estimatedRessourcedWhenFillAvailable = estimateResourcesAfterTimespan(resources, buildings, minutesNeededToFillStorage)

  text += `${emoji.gold} full in ${formatTimeAmount(goldFillTimeNeeded)} (${formatNumberShort(goldCapacity - resources.gold, true)}${emoji.gold})\n`
  text += `${emoji.wood} full in ${formatTimeAmount(woodFillTimeNeeded)} (${formatNumberShort(storageCapacity - resources.wood, true)}${emoji.wood})\n`
  text += `${emoji.stone} full in ${formatTimeAmount(stoneFillTimeNeeded)} (${formatNumberShort(storageCapacity - resources.stone, true)}${emoji.stone})\n`

  if (foodProduction > 0) {
    const foodFillTimeNeeded = (storageCapacity - resources.food) / foodProduction
    text += `${emoji.food} full in ${formatTimeAmount(foodFillTimeNeeded)} (${formatNumberShort(storageCapacity - resources.food, true)}${emoji.food})\n`
  } else if (foodProduction < 0) {
    const foodEmptyTimeNeeded = resources.food / -foodProduction
    text += `${emoji.food} fill with ${formatNumberShort(storageCapacity - resources.food, true)}${emoji.food}\n`
    text += `${emoji.food} empty in ${formatTimeAmount(foodEmptyTimeNeeded)} (${formatNumberShort(resources.food, true)}${emoji.food})\n`
  }

  text += '\n'
  text += `${emoji.storage} fill in ${formatTimeAmount(minutesNeededToFillStorage)} (${formatNumberShort(estimatedRessourcedWhenFillAvailable.gold - resources.gold, true)}${emoji.gold})\n`

  text += '\n'
  text += `${emoji.townhall} ${formatNumberShort(goldProduction, true)}${emoji.gold} per min\n`
  text += `${emoji.townhall} ${formatNumberShort(goldProduction * 60, true)}${emoji.gold} per hour\n`

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
  BUILDINGS,
  defaultBuildingsToShow,
  getBuildingText,
  createBuildingCostPerWinChanceLine,
  createBuildingSemitotalLine,
  createBuildingTimeStatsString,
  createBuildingMaxLevelStatsString,
  createFillTimeStatsString,
  createNeededMaterialStatString
}
