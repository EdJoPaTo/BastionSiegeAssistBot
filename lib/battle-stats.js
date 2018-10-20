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
    rewardAttackWon: getSumAverageAmount(battlereports.filter(o => o.attack && o.won).map(o => o.reward)),
    rewardAttackLost: getSumAverageAmount(battlereports.filter(o => o.attack && !o.won).map(o => o.reward)),
    rewardDefenseWon: getSumAverageAmount(battlereports.filter(o => !o.attack && o.won).map(o => o.reward)),
    rewardDefenseLost: getSumAverageAmount(battlereports.filter(o => !o.attack && !o.won).map(o => o.reward)),
    gems: getSumAverageAmount(battlereports.map(o => o.gems))
  }
}

module.exports = {
  getSumAverageAmount,
  generate
}
