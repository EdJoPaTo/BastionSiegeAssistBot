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
  return {
    reward: getSumAverageAmount(battlereports.map(o => o.reward)),
    rewardAlliance: getSumAverageAmount(battlereports.filter(o => o.friends.length > 1 || o.enemies.length > 1).map(o => o.reward)),
    rewardAttackWon: getSumAverageAmount(battlereports.filter(o => o.attack && o.won).map(o => o.reward)),
    rewardAttackLost: getSumAverageAmount(battlereports.filter(o => o.attack && !o.won).map(o => o.reward)),
    rewardDefenseWon: getSumAverageAmount(battlereports.filter(o => !o.attack && o.won).map(o => o.reward)),
    rewardDefenseLost: getSumAverageAmount(battlereports.filter(o => !o.attack && !o.won).map(o => o.reward)),
    karma: getSumAverageAmount(battlereports.map(o => o.karma)),
    terra: getSumAverageAmount(battlereports.map(o => o.terra)),
    gems: getSumAverageAmount(battlereports.map(o => o.gems))
  }
}

module.exports = {
  getSumAverageAmount,
  generate
}
