function getSumAverageAmount(numbers) {
  const validNumbers = numbers.filter(o => o || o === 0)
  const sum = validNumbers.reduce((a, b) => a + b, 0)
  const amount = validNumbers.length
  return {
    amount,
    avg: sum / amount,
    sum
  }
}

function generate(battlereports) {
  const dragon = '🐲Dragon'
  const undead = '☠️Undead army'

  const battlesWithoutDragonAndUndead = battlereports
    .filter(o => o.enemies[0] !== undead && o.enemies[0] !== dragon)

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
  getSumAverageAmount,
  generate
}
