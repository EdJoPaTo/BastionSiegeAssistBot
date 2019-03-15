const {isMystic} = require('../input/gamescreen-name')

const {getSumAverageAmount, getSumAverageAmountGroupedBy} = require('./number-array')

function generate(battlereports, selector) {
  const battlesWithoutDragonAndUndead = battlereports
    .filter(o => !isMystic(o.enemies[0]))

  return {
    reward: getSumAverageAmount(battlesWithoutDragonAndUndead.map(o => o[selector])),
    rewardAttackWon: generatePerAlliance(battlesWithoutDragonAndUndead.filter(o => o.attack && o.won), o => o[selector]),
    rewardAttackLost: generatePerAlliance(battlesWithoutDragonAndUndead.filter(o => o.attack && !o.won), o => o[selector]),
    rewardDefenseWon: generatePerAlliance(battlesWithoutDragonAndUndead.filter(o => !o.attack && o.won), o => o[selector]),
    rewardDefenseLost: generatePerAlliance(battlesWithoutDragonAndUndead.filter(o => !o.attack && !o.won), o => o[selector]),
    mystics: generatePerAlliance(battlereports.filter(o => isMystic(o.enemies[0])), o => o[selector])
  }
}

function generatePerAlliance(reports, valueSelector) {
  const allianceSelector = o => isMystic(o.enemies[0]) ? o.enemies[0] : o.enemyAlliance
  return getSumAverageAmountGroupedBy(reports, allianceSelector, valueSelector)
}

module.exports = {
  generate
}
