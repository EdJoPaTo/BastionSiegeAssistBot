const {dragon, undead} = require('../input/game-text')
const {isDragonOrUndead} = require('../input/gamescreen-name')

const {getSumAverageAmount} = require('./number-array')

function getAllEnemies(allBattlereports) {
  const enemies = allBattlereports
    .flatMap(o => o.enemies)

  // Order them by occurence count
  // https://stackoverflow.com/questions/22010520/sort-by-number-of-occurrencecount-in-javascript-array
  const battlesObserved = enemies.reduce((p, c) => {
    p[c] = (p[c] || 0) + 1
    return p
  }, {})
  const orderedEnemies = Object.keys(battlesObserved)
    .sort((a, b) => battlesObserved[b] - battlesObserved[a])
  return orderedEnemies
}

function generate(battlereports) {
  const battlesWithoutDragonAndUndead = battlereports
    .filter(o => !isDragonOrUndead(o.enemies[0]))

  return {
    reward: getSumAverageAmount(battlesWithoutDragonAndUndead.map(o => o.reward)),
    rewardAlliance: getSumAverageAmount(battlereports.filter(o => o.friends.length > 1 || o.enemies.length > 1).map(o => o.reward)),
    rewardAttackWon: getSumAverageAmount(battlesWithoutDragonAndUndead.filter(o => o.attack && o.won).map(o => o.reward)),
    rewardAttackLost: getSumAverageAmount(battlesWithoutDragonAndUndead.filter(o => o.attack && !o.won).map(o => o.reward)),
    rewardDefenseWon: getSumAverageAmount(battlesWithoutDragonAndUndead.filter(o => !o.attack && o.won).map(o => o.reward)),
    rewardDefenseLost: getSumAverageAmount(battlesWithoutDragonAndUndead.filter(o => !o.attack && !o.won).map(o => o.reward)),
    karma: getSumAverageAmount(battlereports.map(o => o.karma)),
    terra: getSumAverageAmount(battlereports.map(o => o.terra)),
    rewardDragon: getSumAverageAmount(battlereports.filter(o => o.enemies[0] === dragon).map(o => o.reward)),
    rewardUndead: getSumAverageAmount(battlereports.filter(o => o.enemies[0] === undead).map(o => o.reward)),
    gems: getSumAverageAmount(battlereports.map(o => o.gems))
  }
}

module.exports = {
  getAllEnemies,
  generate
}
