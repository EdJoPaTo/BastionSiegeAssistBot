const {getMidnightXDaysEarlier, getSumAverageAmount} = require('./number-functions')

function hasPlayerProvidedEnoughData(allBattlereports, playername) {
  const daysOfInterest = 7
  const minDate = getMidnightXDaysEarlier(Date.now() / 1000, daysOfInterest)
  const relevantReports = allBattlereports
    .filter(o => o.friends.length === 1)
    .filter(o => o.friends[0] === playername)
    .filter(o => o.time > minDate)

  // Average of 5 per day required
  return relevantReports.length >= daysOfInterest * 5
}

function generate(allBattlereports, playername) {
  const relevantReports = allBattlereports
    .filter(o => o.enemies.length === 1)
    .filter(o => o.enemies[0] === playername)

  const wonBattles = relevantReports
    .filter(o => o.won)
  const lostBattles = relevantReports
    .filter(o => !o.won)

  const onlyAttacks = relevantReports
    .filter(o => o.attack)

  const battlesWithoutLoss = onlyAttacks
    .filter(o => o.soldiersAlive === o.soldiersTotal)

  const successfulAttacks = onlyAttacks
    .filter(o => o.won)
  const loot = getSumAverageAmount(successfulAttacks.map(o => o.reward))

  const strongestArmyThatLost = Math.max(...lostBattles.map(o => o.soldiersTotal))

  // TODO: as the player grows stronger this is not updated. only look at 'new' reports (last month?)
  const smallestSuccessfulArmyLately = Math.min(...wonBattles.map(o => o.soldiersTotal))

  return {
    attacksWithoutLossPercentage: battlesWithoutLoss.length / onlyAttacks.length,
    loot,
    smallestSuccessfulArmyLately,
    strongestArmyThatLost
  }
}

module.exports = {
  generate,
  hasPlayerProvidedEnoughData
}
