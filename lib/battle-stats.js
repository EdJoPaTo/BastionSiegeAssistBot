function getSumAverageAmount(numbers) {
  const sum = numbers.reduce((a, b) => a + b, 0)
  const amount = numbers.length
  return {
    amount,
    avg: sum / amount,
    sum
  }
}

function generate(battlereports) {
  return {
    rewardAttackWon: getSumAverageAmount(battlereports.filter(o => o.attack && o.won).map(o => o.reward)),
    rewardAttackLost: getSumAverageAmount(battlereports.filter(o => o.attack && !o.won).map(o => o.reward)),
    rewardDefenseWon: getSumAverageAmount(battlereports.filter(o => !o.attack && o.won).map(o => o.reward)),
    rewardDefenseLost: getSumAverageAmount(battlereports.filter(o => !o.attack && !o.won).map(o => o.reward)),
    gems: getSumAverageAmount(battlereports.filter(o => o.gems).map(o => o.gems))
  }
}

module.exports = {
  getSumAverageAmount,
  generate
}
