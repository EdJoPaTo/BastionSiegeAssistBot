const {EMOJI} = require('bastion-siege-logic')

const {getSumAverageAmount, getSumAverageAmountGroupedBy} = require('./number-array')

function generate(battlereports, valueSelector) {
  const battlesWithoutDragonAndUndead = battlereports
    .filter(o => !o.enemyMystic)

  return {
    reward: getSumAverageAmount(battlesWithoutDragonAndUndead.map(valueSelector)),
    rewardAttackWon: generatePerAlliance(battlesWithoutDragonAndUndead.filter(o => o.attack && o.won), valueSelector),
    rewardAttackLost: generatePerAlliance(battlesWithoutDragonAndUndead.filter(o => o.attack && !o.won), valueSelector),
    rewardDefenseWon: generatePerAlliance(battlesWithoutDragonAndUndead.filter(o => !o.attack && o.won), valueSelector),
    rewardDefenseLost: generatePerAlliance(battlesWithoutDragonAndUndead.filter(o => !o.attack && !o.won), valueSelector),
    mystics: generatePerAlliance(battlereports.filter(o => o.enemyMystic), valueSelector)
  }
}

function groupBySelector(report) {
  // TODO: refactor out of math
  const {enemyAlliance, enemyMystic} = report
  if (enemyAlliance) {
    return enemyAlliance
  }

  if (enemyMystic) {
    return EMOJI[enemyMystic]
  }

  return undefined
}

function generatePerAlliance(reports, valueSelector) {
  return getSumAverageAmountGroupedBy(reports, groupBySelector, valueSelector)
}

module.exports = {
  generate
}
