import {Battlereport} from 'bastion-siege-logic'
import arrayFilterUnique from 'array-filter-unique'

import {PlayerStats, PlayerStatsActivity, PlayerStatsLoot, ArmyEstimate} from '../types/player-stats'

import {replaceLookingLikeAsciiChars} from '../javascript-abstraction/strings'

import {averageTimeOfDay, getMidnightXDaysEarlier} from './unix-timestamp'
import {getSumAverageAmount} from './number-array'

export function generate(allBattlereports: readonly Battlereport[], playername: string, now: number): PlayerStats {
  const allWithTarget = allBattlereports
    .filter(o => o.enemies.includes(playername))
    // Only one of the multiple alliance attack reports should be considered
    .filter(arrayFilterUnique(o => o.time))

  const allAlliances = allWithTarget
    .map(o => o.enemyAlliance)
    .reduce((sum, a) => {
      if (sum.length === 0 || sum[sum.length - 1] !== a) {
        sum.push(a)
      }

      return sum
    }, [] as (string | undefined)[])

  const alliance = allAlliances.slice(-1)[0]

  const nearPastMinTimestamp = getMidnightXDaysEarlier(now, 30)

  const soloReports = allWithTarget
    .filter(o => o.enemies.length === 1)
    // There has to be only one party involved we know the army about
    .filter(o => o.friends.length === 1)
    .filter(o => o.time > nearPastMinTimestamp)

  const lastBattleTime = Math.max(...allWithTarget.map(o => o.time))

  const nearPastReports = allWithTarget
    .filter(o => o.time > nearPastMinTimestamp)

  return {
    player: playername,
    playerNameLookingLike: replaceLookingLikeAsciiChars(playername),
    alliance,
    allAlliances,
    battlesObserved: allWithTarget.length,
    battlesObservedNearPast: nearPastReports.length,
    lastBattleTime,
    ...generateActivity(nearPastReports, playername),
    ...generateLoot(nearPastReports),
    army: assumeArmy(soloReports),
    terra: assumeTerra(soloReports)
  }
}

function generateActivity(allReports: readonly Battlereport[], playername: string): PlayerStatsActivity {
  const activeTimes = allReports
    // Being attacked or joined a defence
    .filter(o => !o.attack || o.enemies.indexOf(playername) > 0)
    .map(o => o.time)
  const activeTime = averageTimeOfDay(activeTimes)

  const attacks = allReports
    .filter(o => o.attack)
    // There has to be only one party involved we know the army about
    .filter(o => o.friends.length === 1)
  const attacksWithoutLoss = attacks
    .filter(o => o.soldiersAlive === o.soldiersTotal)
  const attacksWithoutLossPercentage = attacksWithoutLoss.length / attacks.length

  const inactiveTimes = attacksWithoutLoss.map(o => o.time)
  const inactiveTime = averageTimeOfDay(inactiveTimes)

  return {
    activeTime,
    attacksWithoutLossPercentage,
    inactiveTime,
    lastTimeObservedActive: Math.max(...activeTimes),
    lastTimeObservedInactive: Math.max(...inactiveTimes)
  }
}

function generateLoot(allReports: readonly Battlereport[]): PlayerStatsLoot {
  const lootRelevantReports = allReports
    .filter(o => o.enemies.length === 1)
    .filter(o => o.won)
    .filter(o => o.attack || o.enemyMystic)

  const loot = getSumAverageAmount(
    lootRelevantReports
      .map(o => o.gold * o.friends.length)
  )
  const lootActive = getSumAverageAmount(
    lootRelevantReports
      .filter(o => o.soldiersAlive !== o.soldiersTotal)
      .map(o => o.gold * o.friends.length)
  )
  const lootInactive = getSumAverageAmount(
    lootRelevantReports
      .filter(o => o.soldiersAlive === o.soldiersTotal)
      .map(o => o.gold * o.friends.length)
  )
  const gems = getSumAverageAmount(allReports.map(o => o.gems))

  return {
    loot,
    lootActive,
    lootInactive,
    gems
  }
}

export function assumeArmy(relevantReports: readonly Battlereport[]): ArmyEstimate {
  const result: any = {}
  let estimate = 0
  const lost = relevantReports
    .filter(o => !o.won)

  const strongestArmyLost = Math.max(...lost.map(o => o.soldiersTotal))
  const mostSoldiersDied = Math.max(...relevantReports.map(o => o.soldiersTotal - o.soldiersAlive))

  const highestEnemyLoot = Math.max(...lost.map(o => -1 * o.gold))
  const armyAssumptionBasedOnLoot = highestEnemyLoot * 0.002 // One army can carry up to 500 gold

  const min = Math.round(Math.max(strongestArmyLost, mostSoldiersDied, armyAssumptionBasedOnLoot))
  if (isFinite(min)) {
    result.min = min
    estimate += min
  }

  const relevantSuccessful = relevantReports
    .filter(o => o.won)
    .filter(o => o.soldiersAlive !== o.soldiersTotal)
    .filter(o => o.soldiersTotal > min)

  const smallestSuccessfulArmy = Math.min(
    ...relevantSuccessful
      .map(o => o.soldiersTotal)
  )
  if (isFinite(smallestSuccessfulArmy)) {
    result.max = smallestSuccessfulArmy
    estimate += smallestSuccessfulArmy
    if (estimate > smallestSuccessfulArmy) {
      estimate /= 2
    }
  }

  result.estimate = estimate || NaN
  return result
}

function assumeTerra(soloReports: readonly Battlereport[]): number {
  let currentEstimate = NaN

  for (const report of soloReports) {
    if (!report.terra) {
      continue
    }

    if (report.won) {
      // You get 5% of the Terra the enemy had beforehead. -> 20 times of what you got
      // As you get 5% the other has 95% / 19 times left.
      currentEstimate = report.terra * 19
    } else {
      currentEstimate -= report.terra
    }
  }

  return currentEstimate
}
