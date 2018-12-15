const {filterUnique} = require('../javascript-abstraction/array')

const {isDragonOrUndead} = require('../input/gamescreen-name')

const {getMidnightXDaysEarlier} = require('./unix-timestamp')
const {getSumAverageAmount} = require('./number-array')
const {getAllEnemies} = require('./battle-stats')
const {averageTimeOfDay} = require('./unix-timestamp')

const IMMUNITY_CHECK_DAYS = 7

function hasPlayerProvidedEnoughData(allBattlereports, playername) {
  const daysOfInterest = IMMUNITY_CHECK_DAYS
  const relevantReports = getReportsRelevantForImmunityCheck(allBattlereports, daysOfInterest)
    .filter(o => o.friends[0] === playername)
  return hasPlayerProvidedEnoughDataImpl(relevantReports, daysOfInterest)
}

function hasPlayerProvidedEnoughDataImpl(relevantReports, daysOfInterest) {
  // Average of 5 per day required
  return relevantReports.length >= daysOfInterest * 5
}

function getReportsRelevantForImmunityCheck(allBattlereports, daysOfInterest) {
  const minDate = getMidnightXDaysEarlier(Date.now() / 1000, daysOfInterest)
  return allBattlereports
    .filter(o => o.friends.length === 1)
    .filter(o => o.time > minDate)
}

function usageStats(allBattlereports) {
  const relevantForImmunity = getReportsRelevantForImmunityCheck(allBattlereports, IMMUNITY_CHECK_DAYS)

  const enemies = getAllEnemies(allBattlereports)

  const immune = enemies
    .filter(enemy =>
      hasPlayerProvidedEnoughDataImpl(
        relevantForImmunity.filter(o => o.friends[0] === enemy),
        IMMUNITY_CHECK_DAYS
      )
    )

  return {
    enemies,
    immune
  }
}

function generate(allBattlereports, playername) {
  const allWithTarget = allBattlereports
    .filter(o => o.enemies.indexOf(playername) >= 0)

  const relevantReports = allWithTarget
    .filter(o => o.enemies.length === 1)
    // There has to be only one party involved we know the army about
    .filter(o => o.friends.length === 1)

  const wonBattles = relevantReports
    .filter(o => o.won)
  const lostBattles = relevantReports
    .filter(o => !o.won)

  const attacks = relevantReports
    .filter(o => o.attack)
  const defences = relevantReports
    .filter(o => !o.attack)

  const lastBattleTime = Math.max(...relevantReports.map(o => o.time))

  const enemyAttackedOnTimes = allWithTarget
    .filter(o => !o.attack)
    .map(o => o.time)
  const activeTime = averageTimeOfDay(enemyAttackedOnTimes)

  const attacksWithoutLoss = attacks
    .filter(o => o.soldiersAlive === o.soldiersTotal)
  const attacksWithoutLossPercentage = attacksWithoutLoss.length / attacks.length

  const loot = getSumAverageAmount(
    allWithTarget
      .filter(o => o.enemies.length === 1)
      .filter(o => o.attack || isDragonOrUndead(o.enemies[0]))
      // Only one of the multiple alliance attack reports should be considered
      .filter(filterUnique(o => o.time))
      .map(o => o.reward * o.friends.length)
  )
  const gems = getSumAverageAmount(wonBattles.map(o => o.gems))

  return {
    player: playername,
    immune: hasPlayerProvidedEnoughData(allBattlereports, playername),
    battlesObserved: allWithTarget.filter(filterUnique(o => o.time)).length,
    winsObserved: wonBattles.length,
    lossesObserved: lostBattles.length,
    lastBattleTime,
    activeTime,
    attacksWithoutLossPercentage,
    loot,
    gems,
    armyAttack: assumeArmy(attacks),
    armyDefense: assumeArmy(defences)
  }
}

function assumeArmy(relevantReports) {
  const result = {}
  const lost = relevantReports
    .filter(o => !o.won)

  const strongestArmyLost = Math.max(...lost.map(o => o.soldiersTotal))

  const highestEnemyLoot = Math.max(...lost.map(o => -1 * o.reward))
  const armyAssumptionBasedOnLoot = highestEnemyLoot * 0.002 // One army can carry up to 500 gold

  const min = Math.round(Math.max(strongestArmyLost, armyAssumptionBasedOnLoot))
  if (isFinite(min)) {
    result.min = min
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

    const smallestSuccessfulReports = relevantSuccessful
      .filter(o => o.soldiersTotal === smallestSuccessfulArmy)
      // Order by newest first
      .sort((a, b) => b.time - a.time)

    const newestSmallestSuccessfulReport = smallestSuccessfulReports[0]
    result.maxtime = newestSmallestSuccessfulReport.time

    const maxPercentAlive = newestSmallestSuccessfulReport.soldiersAlive / newestSmallestSuccessfulReport.soldiersTotal
    result.maxPercentLost = 1 - maxPercentAlive
  }

  return result
}

module.exports = {
  assumeArmy,
  generate,
  hasPlayerProvidedEnoughData,
  usageStats
}
