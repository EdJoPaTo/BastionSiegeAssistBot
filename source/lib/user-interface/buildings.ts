import {
  BATTLE_ODDS,
  BattleBuilding,
  Buildings,
  calcBuildingCost,
  calcBuildingCostPerWinchance,
  calcBuildingCostUntil,
  calcGoldCapacity,
  calcGoldIncome,
  calcMaxBuildingLevel,
  calcMinutesNeeded,
  calcMinutesNeededToFillStorage,
  calcNeeded,
  calcProduction,
  calcProductionFood,
  calcSemitotalGold,
  calcStorageCapacity,
  calcStorageLevelNeededForUpgrade,
  calcTownhallLevelNeededForUpgrade,
  ConstructionName,
  ConstructionResources,
  Constructions,
  estimateResourcesAfter,
  Resources
} from 'bastion-siege-logic'

import {Context} from '../types'

import {emoji} from './output-text'
import {formatNumberShort, formatTimeAmount} from './format-number'

export const defaultBuildingsToShow: readonly ConstructionName[] = ['townhall', 'storage', 'houses', 'mine', 'barracks', 'wall', 'trebuchet', 'ballista']

export function getBuildingText(ctx: Context, building: ConstructionName): string {
  return `${emoji[building]} ${ctx.i18n.t('bs.building.' + building)}`
}

export function createBuildingCostPerWinChanceLine(battleType: 'solo' | 'alliance', buildingName: BattleBuilding, currentLevel: number): string {
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

export function createBuildingTimeStatsString(buildingName: ConstructionName, buildings: Constructions, resources: Resources): string {
  let text = ''

  text += emoji[buildingName] + ' '
  if (buildings[buildingName] === undefined) {
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

    const neededResources = calcNeeded(cost, resources)
    const goldNeededWithCurrentResources = calcSemitotalGold(neededResources) + resources.gold
    const neededMaterialString = createMaterialStatString(neededResources)

    if (goldNeededWithCurrentResources > goldCapacity) {
      text += ' ' + emoji.gold + emoji.warning
    }

    text += ` ${neededMaterialString}`
  }

  return text
}

export function createBuildingMaxLevelStatsString(buildingName: ConstructionName, buildings: Constructions, resources: Resources): string {
  const currentBuildingLevel = buildings[buildingName]

  let text = emoji[buildingName] + ' '
  if (currentBuildingLevel === undefined) {
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

  text += '+'
  text += difference
  text += ': '
  text += formatTimeAmount(minutesNeeded)

  return text
}

export function createFillTimeStatsString(buildings: Buildings, resources: Resources): string {
  let text = ''

  const goldCapacity = calcGoldCapacity(buildings.townhall)
  const storageCapacity = calcStorageCapacity(buildings.storage)

  const goldProduction = calcGoldIncome(buildings.townhall, buildings.houses)
  const goldFillTimeNeeded = (goldCapacity - resources.gold) / goldProduction
  const woodFillTimeNeeded = (storageCapacity - resources.wood) / calcProduction(buildings.sawmill)
  const stoneFillTimeNeeded = (storageCapacity - resources.stone) / calcProduction(buildings.mine)
  const foodProduction = calcProductionFood(buildings.farm, buildings.houses)

  const minutesNeededToFillStorage = calcMinutesNeededToFillStorage(buildings, resources)
  const estimatedRessourcedWhenFillAvailable = estimateResourcesAfter(resources, buildings, minutesNeededToFillStorage)

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

  return text
}

export function createCapacityStatsString(buildings: Buildings): string {
  const goldCapacity = calcGoldCapacity(buildings.townhall)
  const storageCapacity = calcStorageCapacity(buildings.storage)

  let text = ''
  text += `${emoji.townhall} ≤${formatNumberShort(goldCapacity, true)}${emoji.gold}\n`
  text += `${emoji.storage} ≤${formatNumberShort(storageCapacity, true)}\n`

  return text
}

export function createIncomeStatsString(buildings: Buildings, timeInMinutes: number): string {
  const goldCapacity = calcGoldCapacity(buildings.townhall)
  const storageCapacity = calcStorageCapacity(buildings.storage)

  const goldIncome = calcGoldIncome(buildings.townhall, buildings.houses) * timeInMinutes
  const woodIncome = calcProduction(buildings.sawmill) * timeInMinutes
  const stoneIncome = calcProduction(buildings.mine) * timeInMinutes
  const foodIncome = calcProductionFood(buildings.farm, buildings.houses) * timeInMinutes

  let text = ''
  text += `${emoji.townhall} ${formatNumberShort(goldIncome, true)}${emoji.gold}${goldIncome > goldCapacity ? ' ⚠️' : ''}\n`
  text += `${emoji.sawmill} ${formatNumberShort(woodIncome, true)}${emoji.wood}${woodIncome > storageCapacity ? ' ⚠️' : ''}\n`
  text += `${emoji.mine} ${formatNumberShort(stoneIncome, true)}${emoji.stone}${stoneIncome > storageCapacity ? ' ⚠️' : ''}\n`
  text += `${emoji.farm} ${formatNumberShort(foodIncome, true)}${emoji.food}${Math.abs(foodIncome) > storageCapacity ? ' ⚠️' : ''}\n`

  return text
}

export function createMaterialStatString(resources: ConstructionResources): string {
  const neededMaterial = []
  if (resources.gold > 0) {
    neededMaterial.push(`${formatNumberShort(resources.gold, true)}${emoji.gold}`)
  }

  if (resources.wood > 0) {
    neededMaterial.push(`${formatNumberShort(resources.wood, true)}${emoji.wood}`)
  }

  if (resources.stone > 0) {
    neededMaterial.push(`${formatNumberShort(resources.stone, true)}${emoji.stone}`)
  }

  return neededMaterial.join(' ')
}
