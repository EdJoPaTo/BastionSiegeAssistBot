const {emoji: gamescreenEmoji} = require('../lib/gamescreen.emoji')
const {ONE_DAY_IN_SECONDS, formatNumberShort, formatTime} = require('../lib/number-functions')
const {calcGoldCapacity, calcGoldIncome, calcBuildingCost, calcProduction, calcProductionFood, calcStorageCapacity, calcStorageLevelNeededForUpgrade, calcTownhallLevelNeededForUpgrade, calcMinutesNeeded, calcMinutesNeededToFillStorage, estimateResourcesAfterTimespan} = require('../lib/siegemath')

const battleStats = require('./battle-stats')

const emoji = Object.assign({}, gamescreenEmoji, {
  ballista: '🐲'
})

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

function createBattleStatsString(battlereports) {
  const stats = battleStats.generate(battlereports)

  let text = `*Battle Stats* of last 7d (${battlereports.length})`

  text += '\n' + createSumAverageAmountString(stats.reward, 'Rewards', emoji.gold)
  text += '\n' + createSumAverageAmountString(stats.rewardAlliance, 'Alliance Battles', emoji.gold)

  text += '\n'
  text += '\n' + createSumAverageAmountString(stats.rewardAttackWon, 'Successful Attacks', emoji.gold)
  text += '\n' + createSumAverageAmountString(stats.rewardDefenseWon, 'Successful Defenses', emoji.gold)
  text += '\n' + createSumAverageAmountString(stats.rewardAttackLost, 'Lost Attacks', emoji.gold)
  text += '\n' + createSumAverageAmountString(stats.rewardDefenseLost, 'Lost Defenses', emoji.gold)

  text += '\n'
  text += '\n' + createSumAverageAmountString(stats.karma, 'Karma', emoji.karma)
  text += '\n' + createSumAverageAmountString(stats.terra, 'Terra', emoji.terra)

  text += '\n'
  text += '\n' + createSumAverageAmountString(stats.rewardDragon, 'Dragon', emoji.gold)
  text += '\n' + createSumAverageAmountString(stats.rewardUndead, 'Undead', emoji.gold)
  text += '\n' + createSumAverageAmountString(stats.gems, 'Gems', emoji.gem)

  return text
}

function createPlayerStatsString(allBattlereports, stats) {
  let text = `*${stats.player}*\n`

  if (stats.immune) {
    text += '\nThis player is an active user of this bot. You will not get any information about him. Do the same and get the same kind of protection. 🛡💙'
    return text
  }

  text += createArmyStatsBarLine(stats.armyAttack, emoji.army)
  text += createArmyStatsBarLine(stats.armyDefense, emoji.wall)

  text += `\nBattles observed: ${stats.battlesObserved} (Wins: ${stats.winsObserved}; Losses: ${stats.lossesObserved})`

  if (stats.attacksWithoutLossPercentage >= 0) {
    text += `\nInactive: ${Math.round(stats.attacksWithoutLossPercentage * 100)}% (100% is best for easy loot)`
  }
  text += '\n' + createSumAverageAmountString(stats.loot, 'Loot', emoji.gold)
  if (stats.gems.amount > 0) {
    text += '\n' + createSumAverageAmountString(stats.gems, 'Gems', emoji.gem)
  }

  return text
}

function createArmyStatsBarLine(data, armyTypeEmoji) {
  let text = ''
  if (!data.min && !data.max) {
    return text
  }

  text += isFinite(data.min) ? data.min : '?????'

  text += ` < ${armyTypeEmoji} < `

  if (isFinite(data.max)) {
    text += data.max
    text += ' ('
    text += `${Math.round(data.maxPerventLost * 100)}%${emoji.army} lost`
    text += '; '
    const daysAgo = ((Date.now() / 1000) - data.maxtime) / ONE_DAY_IN_SECONDS
    text += `${Math.round(daysAgo)}d ago`
    text += ')'
  } else {
    text += '?????'
  }

  text += '\n'
  return text
}

function createPlayerStatsShortString(allBattlereports, stats) {
  let text = ''

  if (stats.immune) {
    text += '🛡💙 This player is an active user of this bot. You will not get any information about him.'
    return text
  }

  text += ` ${stats.battlesObserved} battle${stats.battlesObserved > 1 ? 's' : ''} observed (${stats.winsObserved}|${stats.lossesObserved}).`
  if (stats.attacksWithoutLossPercentage >= 0) {
    text += ` Inactive: ${Math.round(stats.attacksWithoutLossPercentage * 100)}%.`
  }
  if (stats.loot.amount > 0) {
    text += ` Loot (${stats.loot.amount}): <${formatNumberShort(stats.loot.max)}${emoji.gold}.`
  }

  return text.trim()
}

function createSumAverageAmountString(data, name, unit) {
  // Assumes the data is for integers
  let line = `${name} `
  line += `(${formatNumberShort(data.amount, true)})`

  if (data.amount > 0) {
    line += ': '
    if (data.amount > 1) {
      line += `~${formatNumberShort(data.avg)}${unit}`
      line += ' ('
      line += `Min: ${formatNumberShort(data.min, true)}${unit}`
      line += '; '
      line += `Max: ${formatNumberShort(data.max, true)}${unit}`
      line += '; '
      line += `Total: ${formatNumberShort(data.sum, true)}${unit}`
      line += ')'
    } else {
      line += `${formatNumberShort(data.avg, true)}${unit}`
    }
  }
  return line
}

module.exports = {
  emoji,
  createBuildingTimeStatsString,
  createFillTimeStatsString,
  createNeededMaterialStatString,
  createBattleStatsString,
  createPlayerStatsString,
  createPlayerStatsShortString,
  createSumAverageAmountString
}
