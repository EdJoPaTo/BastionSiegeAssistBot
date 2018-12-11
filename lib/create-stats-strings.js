const {emoji: gamescreenEmoji} = require('../lib/gamescreen.emoji')
const {ONE_DAY_IN_SECONDS, formatNumberShort, formatTime} = require('../lib/number-functions')
const {createAverageSumString, createAverageMaxString} = require('../lib/number-function-strings')
const {calcGoldCapacity, calcGoldIncome, calcBuildingCost, calcProduction, calcProductionFood, calcStorageCapacity, calcStorageLevelNeededForUpgrade, calcTownhallLevelNeededForUpgrade, calcMinutesNeeded, calcMinutesNeededToFillStorage, estimateResourcesAfterTimespan} = require('../lib/siegemath')

const battleStats = require('./battle-stats')

const emoji = {...gamescreenEmoji,
  ballista: gamescreenEmoji.dragon
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

  const goldProduction = calcGoldIncome(buildings.townhall, buildings.houses)
  const goldFillTimeNeeded = (goldCapacity - resources.gold) / goldProduction
  const woodFillTimeNeeded = (storageCapacity - resources.wood) / calcProduction(buildings.sawmill)
  const stoneFillTimeNeeded = (storageCapacity - resources.stone) / calcProduction(buildings.mine)
  const foodProduction = calcProductionFood(buildings.farm, buildings.houses)

  const minutesNeededToFillStorage = calcMinutesNeededToFillStorage(buildings, resources)
  const estimatedRessourcedWhenFillAvailable = estimateResourcesAfterTimespan(resources, buildings, minutesNeededToFillStorage)

  text += `${emoji.gold} full in ${formatTime(goldFillTimeNeeded)} (${formatNumberShort(goldCapacity - resources.gold, true)}${emoji.gold})\n`
  text += `${emoji.wood} full in ${formatTime(woodFillTimeNeeded)} (${formatNumberShort(storageCapacity - resources.wood, true)}${emoji.wood})\n`
  text += `${emoji.stone} full in ${formatTime(stoneFillTimeNeeded)} (${formatNumberShort(storageCapacity - resources.stone, true)}${emoji.stone})\n`

  if (foodProduction > 0) {
    const foodFillTimeNeeded = (storageCapacity - resources.food) / foodProduction
    text += `${emoji.food} full in ${formatTime(foodFillTimeNeeded)} (${formatNumberShort(storageCapacity - resources.food, true)}${emoji.food})\n`
  } else if (foodProduction < 0) {
    const foodEmptyTimeNeeded = resources.food / -foodProduction
    text += `${emoji.food} fill with ${formatNumberShort(storageCapacity - resources.food, true)}${emoji.food}\n`
    text += `${emoji.food} empty in ${formatTime(foodEmptyTimeNeeded)} (${formatNumberShort(resources.food, true)}${emoji.food})\n`
  }

  text += '\n'
  text += `${emoji.storage} fill in ${formatTime(minutesNeededToFillStorage)} (${formatNumberShort(estimatedRessourcedWhenFillAvailable.gold - resources.gold, true)}${emoji.gold})\n`

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

function createBattleStatsString(battlereports) {
  const stats = battleStats.generate(battlereports)

  let text = `*Battle Stats* of last 7d (${battlereports.length})`

  text += '\n' + createAverageSumString(stats.reward, 'Rewards', emoji.gold, true)
  text += '\n' + createAverageSumString(stats.rewardAlliance, 'Alliance Battles', emoji.gold, true)

  text += '\n'
  text += '\n' + createAverageSumString(stats.rewardAttackWon, 'Successful Attacks', emoji.gold, true)
  text += '\n' + createAverageSumString(stats.rewardDefenseWon, 'Successful Defenses', emoji.gold, true)
  text += '\n' + createAverageSumString(stats.rewardAttackLost, 'Lost Attacks', emoji.gold, true)
  text += '\n' + createAverageSumString(stats.rewardDefenseLost, 'Lost Defenses', emoji.gold, true)

  text += '\n'
  text += '\n' + createAverageSumString(stats.karma, 'Karma', emoji.karma, true)
  text += '\n' + createAverageSumString(stats.terra, 'Terra', emoji.terra, true)

  text += '\n'
  text += '\n' + createAverageSumString(stats.rewardDragon, 'Dragon', emoji.gold, true)
  text += '\n' + createAverageSumString(stats.rewardUndead, 'Undead', emoji.gold, true)
  text += '\n' + createAverageSumString(stats.gems, 'Gems', emoji.gem, true)

  return text
}

function createPlayerStatsString(allBattlereports, stats) {
  let text = `*${stats.player}*`

  if (stats.immune) {
    text += '\nThis player is an active user of this bot. You will not get any information from me. Do the same and get the same kind of protection. 🛡💙'
    return text
  }

  text += createArmyStatsBarLine(stats.armyAttack, emoji.army)
  text += createArmyStatsBarLine(stats.armyDefense, emoji.wall)
  const daysAgo = ((Date.now() / 1000) - stats.lastBattleTime) / ONE_DAY_IN_SECONDS

  text += `\nBattles observed: ${stats.battlesObserved}`
  if (isFinite(daysAgo)) {
    text += ` (≥${Math.round(daysAgo)}d ago)`
  }

  if (stats.attacksWithoutLossPercentage >= 0) {
    text += `\nInactive: ${Math.round(stats.attacksWithoutLossPercentage * 100)}%`
  }
  if (stats.loot.amount > 0) {
    text += '\n' + createAverageMaxString(stats.loot, 'Loot', emoji.gold, true)
  }
  if (stats.gems.amount > 0) {
    text += '\n' + createAverageMaxString(stats.gems, 'Gems', emoji.gem, true)
  }

  return text
}

function createArmyStatsBarLine(data, armyTypeEmoji) {
  let text = ''
  if (!data.min && !data.max) {
    return text
  }
  text += '\n'

  text += isFinite(data.min) ? data.min : '?????'

  text += ` < ${armyTypeEmoji} < `

  if (isFinite(data.max)) {
    text += data.max
    text += ' ('
    text += `${Math.round(data.maxPercentLost * 100)}%${emoji.army} lost`
    text += ')'
  } else {
    text += '?????'
  }
  return text
}

function createPlayerStatsShortString(allBattlereports, stats) {
  let text = ''

  if (stats.immune) {
    text += '🛡💙 This player is an active user of this bot. You will not get any information from me.'
    return text
  }

  text += ` ${stats.battlesObserved} battle${stats.battlesObserved > 1 ? 's' : ''} observed (${stats.winsObserved}|${stats.lossesObserved}).`
  if (stats.attacksWithoutLossPercentage >= 0) {
    text += ` Inactive: ${Math.round(stats.attacksWithoutLossPercentage * 100)}%.`
  }
  if (stats.loot.amount > 0) {
    text += ' ' + createAverageMaxString(stats.loot, 'Loot', emoji.gold, true)
  }

  return text.trim()
}

module.exports = {
  emoji,
  createBuildingTimeStatsString,
  createFillTimeStatsString,
  createNeededMaterialStatString,
  createBattleStatsString,
  createPlayerStatsString,
  createPlayerStatsShortString
}
