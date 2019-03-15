const {isMystic} = require('../input/gamescreen-name')

const {getSumAverageAmount, getSumAverageAmountGroupedBy} = require('./number-array')

function generate(battlereports, valueSelector) {
  const battlesWithoutDragonAndUndead = battlereports
    .filter(o => !isMystic(o.enemies[0]))

  return {
    reward: getSumAverageAmount(battlesWithoutDragonAndUndead.map(valueSelector)),
    rewardAttackWon: generatePerAlliance(battlesWithoutDragonAndUndead.filter(o => o.attack && o.won), valueSelector),
    rewardAttackLost: generatePerAlliance(battlesWithoutDragonAndUndead.filter(o => o.attack && !o.won), valueSelector),
    rewardDefenseWon: generatePerAlliance(battlesWithoutDragonAndUndead.filter(o => !o.attack && o.won), valueSelector),
    rewardDefenseLost: generatePerAlliance(battlesWithoutDragonAndUndead.filter(o => !o.attack && !o.won), valueSelector),
    mystics: generatePerAlliance(battlereports.filter(o => isMystic(o.enemies[0])), valueSelector)
  }
}

function generatePerAlliance(reports, valueSelector) {
  const allianceSelector = o => isMystic(o.enemies[0]) ? o.enemies[0] : o.enemyAlliance
  return getSumAverageAmountGroupedBy(reports, allianceSelector, valueSelector)
}

module.exports = {
  generate
}
