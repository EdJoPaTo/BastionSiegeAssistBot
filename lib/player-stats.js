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
  const defences = relevantReports
    .filter(o => !o.attack)

  const battlesWithoutLoss = onlyAttacks
    .filter(o => o.soldiersAlive === o.soldiersTotal)

  const loot = getSumAverageAmount(wonBattles.map(o => o.reward))
  const gems = getSumAverageAmount(wonBattles.map(o => o.gems))

  return {
    player: playername,
    immune: hasPlayerProvidedEnoughData(allBattlereports, playername),
    battlesObserved: relevantReports.length,
    winsObserved: wonBattles.length,
    lossesObserved: lostBattles.length,
    attacksWithoutLossPercentage: battlesWithoutLoss.length / onlyAttacks.length,
    loot,
    gems,
    armyAttack: assumeArmy(onlyAttacks),
    armyDefense: assumeArmy(defences)
  }
}

function assumeArmy(relevantReports) {
  const result = {}
  const strongestArmyLost = Math.max(
    ...relevantReports
      .filter(o => !o.won)
      .map(o => o.soldiersTotal)
  )
  if (isFinite(strongestArmyLost)) {
    result.min = strongestArmyLost
  }

  const smallestSuccessfulArmy = Math.min(
    ...relevantReports
      .filter(o => o.won)
      .map(o => o.soldiersTotal)
      .filter(o => o > strongestArmyLost)
  )
  if (isFinite(smallestSuccessfulArmy)) {
    result.max = smallestSuccessfulArmy

    const smallestSuccessfulReports = relevantReports
      .filter(o => o.won && o.soldiersTotal === smallestSuccessfulArmy)

    const newestSmallestSuccessfulTime = Math.max(
      ...smallestSuccessfulReports
        .map(o => Number(o.time))
    )
    result.maxtime = newestSmallestSuccessfulTime

    const newestSmallestSuccessfulReport = smallestSuccessfulReports
      .filter(o => Number(o.time) === newestSmallestSuccessfulTime)[0]

    const maxPercentAlive = newestSmallestSuccessfulReport.soldiersAlive / newestSmallestSuccessfulReport.soldiersTotal
    result.maxPerventLost = 1 - maxPercentAlive
  }

  return result
}

module.exports = {
  generate,
  hasPlayerProvidedEnoughData
}
