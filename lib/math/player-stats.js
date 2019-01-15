const {filterUnique} = require('../javascript-abstraction/array')

const poweruser = require('../data/poweruser')

const {isMystic} = require('../input/gamescreen-name')

const {getSumAverageAmount} = require('./number-array')
const {averageTimeOfDay} = require('./unix-timestamp')

function generate(allBattlereports, playername) {
  const allWithTarget = allBattlereports
    .filter(o => o.enemies.indexOf(playername) >= 0)

  const alliance = allWithTarget.map(o => o.enemyAlliance).slice(-1)[0]

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
  const inactiveTime = averageTimeOfDay(attacksWithoutLoss.map(o => o.time))

  const loot = getSumAverageAmount(
    allWithTarget
      .filter(o => o.enemies.length === 1)
      .filter(o => o.won)
      .filter(o => o.attack || isMystic(o.enemies[0]))
      // Only one of the multiple alliance attack reports should be considered
      .filter(filterUnique(o => o.time))
      .map(o => o.reward * o.friends.length)
  )
  const gems = getSumAverageAmount(wonBattles.map(o => o.gems))

  return {
    player: playername,
    alliance,
    immune: poweruser.isImmune(allBattlereports, playername),
    battlesObserved: allWithTarget.filter(filterUnique(o => o.time)).length,
    winsObserved: wonBattles.length,
    lossesObserved: lostBattles.length,
    lastBattleTime,
    activeTime,
    attacksWithoutLossPercentage,
    inactiveTime,
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
  const mostSoldiersDied = Math.max(...relevantReports.map(o => o.soldiersTotal - o.soldiersAlive))

  const highestEnemyLoot = Math.max(...lost.map(o => -1 * o.reward))
  const armyAssumptionBasedOnLoot = highestEnemyLoot * 0.002 // One army can carry up to 500 gold

  const min = Math.round(Math.max(strongestArmyLost, mostSoldiersDied, armyAssumptionBasedOnLoot))
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
  generate
}
