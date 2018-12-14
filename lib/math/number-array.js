function getSumAverageAmount(numbers) {
  const validNumbers = numbers.filter(o => o || o === 0)
  const sum = validNumbers.reduce((a, b) => a + b, 0)
  const amount = validNumbers.length
  const avg = sum / amount

  const tmpVariance = validNumbers
    .map(o => o - avg)
    .map(o => o * o)
    .reduce((a, b) => a + b, 0)
  const variance = tmpVariance / amount
  const stdDeviation = Math.sqrt(variance)

  return {
    amount,
    avg,
    min: Math.min(...validNumbers),
    max: Math.max(...validNumbers),
    stdDeviation,
    sum
  }
}

module.exports = {
  getSumAverageAmount
}
