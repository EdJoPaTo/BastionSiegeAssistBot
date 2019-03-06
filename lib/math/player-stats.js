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

  const soloReports = allWithTarget
    .filter(o => o.enemies.length === 1)
    // There has to be only one party involved we know the army about
    .filter(o => o.friends.length === 1)

  const wonBattles = soloReports
    .filter(o => o.won)
  const lostBattles = soloReports
    .filter(o => !o.won)

  const lastBattleTime = Math.max(...allWithTarget.map(o => o.time))

  return {
    player: playername,
    alliance,
    battlesObserved: allWithTarget.length,
    winsObserved: wonBattles.length,
    lossesObserved: lostBattles.length,
    lastBattleTime,
    ...generateActivity(allWithTarget, playername),
    ...generateLoot(allWithTarget),
    army: assumeArmy(soloReports)
  }
}

function generateActivity(allReports, playername) {
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

  const inactiveTime = averageTimeOfDay(attacksWithoutLoss.map(o => o.time))

  return {
    activeTime,
    attacksWithoutLossPercentage,
    inactiveTime
  }
}

function generateLoot(allReports) {
  const lootRelevantReports = allReports
    .filter(o => o.enemies.length === 1)
    .filter(o => o.won)
    .filter(o => o.attack || isMystic(o.enemies[0]))

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
