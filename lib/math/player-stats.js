const arrayFilterUnique = require('array-filter-unique')

const {isMystic} = require('../input/gamescreen-name')

const {getSumAverageAmount} = require('./number-array')
const {averageTimeOfDay} = require('./unix-timestamp')

function generate(allBattlereports, playername) {
  const allWithTarget = allBattlereports
    .filter(o => o.enemies.includes(playername))
    // Only one of the multiple alliance attack reports should be considered
    .filter(arrayFilterUnique(o => o.time))

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

  const lastBattleTime = Math.max(...relevantReports.map(o => o.time))

  const activeTimes = allWithTarget
    // Being attacked or joined a defence
    .filter(o => !o.attack || o.enemies.indexOf(playername) > 0)
    .map(o => o.time)
  const activeTime = averageTimeOfDay(activeTimes)

  const attacksWithoutLoss = attacks
    .filter(o => o.soldiersAlive === o.soldiersTotal)
  const attacksWithoutLossPercentage = attacksWithoutLoss.length / attacks.length
  const inactiveTime = averageTimeOfDay(attacksWithoutLoss.map(o => o.time))

  const loot = getSumAverageAmount(
    allWithTarget
      .filter(o => o.enemies.length === 1)
      .filter(o => o.won)
      .filter(o => o.attack || isMystic(o.enemies[0]))
      .map(o => o.gold * o.friends.length)
  )
  const gems = getSumAverageAmount(wonBattles.map(o => o.gems))

  return {
    player: playername,
    alliance,
    battlesObserved: allWithTarget.length,
    winsObserved: wonBattles.length,
    lossesObserved: lostBattles.length,
    lastBattleTime,
    activeTime,
    attacksWithoutLossPercentage,
    inactiveTime,
    loot,
    gems,
    army: assumeArmy(relevantReports)
  }
}

function assumeArmy(relevantReports) {
  const result = {}
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

module.exports = {
  assumeArmy,
  generate
}
