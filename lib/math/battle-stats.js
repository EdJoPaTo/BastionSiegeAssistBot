const arrayFilterUnique = require('array-filter-unique')

const {getOccurenceCount, sortBy} = require('../javascript-abstraction/array')

const {isMystic} = require('../input/gamescreen-name')

const {getSumAverageAmount} = require('./number-array')

function generate(battlereports) {
  const battlesWithoutDragonAndUndead = battlereports
    .filter(o => !isMystic(o.enemies[0]))

  return {
    reward: getSumAverageAmount(battlesWithoutDragonAndUndead.map(o => o.gold)),
    rewardAlliance: getSumAverageAmount(battlereports.filter(o => o.friends.length > 1 || o.enemies.length > 1).map(o => o.gold)),
    rewardAttackWon: generatePerAlliance(battlesWithoutDragonAndUndead.filter(o => o.attack && o.won), o => o.gold),
    rewardAttackLost: generatePerAlliance(battlesWithoutDragonAndUndead.filter(o => o.attack && !o.won), o => o.gold),
    rewardDefenseWon: generatePerAlliance(battlesWithoutDragonAndUndead.filter(o => !o.attack && o.won), o => o.gold),
    rewardDefenseLost: generatePerAlliance(battlesWithoutDragonAndUndead.filter(o => !o.attack && !o.won), o => o.gold),
    karma: getSumAverageAmount(battlereports.map(o => o.karma)),
    terra: getSumAverageAmount(battlereports.map(o => o.terra)),
    mystics: generatePerAlliance(battlereports.filter(o => isMystic(o.enemies[0])), o => o.gold),
    gems: getSumAverageAmount(battlereports.map(o => o.gems))
  }
}

function generatePerAlliance(reports, valueSelector) {
  let results = [{
    alliance: 'total',
    stats: getSumAverageAmount(reports.map(valueSelector))
  }]

  const alliances = reports
    .map(o => isMystic(o.enemies[0]) ? o.enemies[0] : o.enemyAlliance)
    .map(o => String(o))
  const allianceOccurences = getOccurenceCount(alliances)
  const orderedAlliances = alliances
    .filter(arrayFilterUnique())
    .sort(sortBy(o => allianceOccurences[o], true))

  const alliancesStats = orderedAlliances
    .map(alliance => ({
      alliance,
      stats: getSumAverageAmount(
        reports
          .filter(o => isMystic(o.enemies[0]) ? o.enemies[0] === alliance : String(o.enemyAlliance) === alliance)
          .map(valueSelector)
      )
    }))
    .sort((a, b) => {
      const diffSum = Math.abs(b.stats.sum) - Math.abs(a.stats.sum)
      if (diffSum !== 0) {
        return diffSum
      }

      const diffAmount = b.stats.amount - a.stats.amount
      return diffAmount
    })
  results = results.concat(alliancesStats)

  return results
}

module.exports = {
  generate
}
