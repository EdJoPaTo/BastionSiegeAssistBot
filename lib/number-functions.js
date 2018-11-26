const allLetters = ['', 'k', 'M', 'B', 'T']

function formatNumberShort(value, isInteger = false) {
  if (!value && value !== 0) {
    return 'NaN'
  }

  const isNegative = value < 0
  if (isNegative) {
    value *= -1
  }

  const exponent = value === 0 ? 0 : Math.floor(Math.log10(value) + 1)
  const engineerExponentLevel = Math.max(0, Math.floor((exponent - 1) / 3))
  const engineerExponent = engineerExponentLevel * 3
  const letter = allLetters[engineerExponentLevel]
  const shortValue = value / (10 ** engineerExponent)

  let fractionDigits = Math.min(2, 3 - (exponent - engineerExponent))
  if (isInteger && engineerExponentLevel === 0) {
    fractionDigits = 0
  }

  const valueString = shortValue.toFixed(fractionDigits)
  return (isNegative ? '-' : '') + valueString + letter
}

function formatTime(totalMinutes) {
  const minutes = Math.floor(totalMinutes) % 60
  const hours = Math.floor(totalMinutes / 60) % 24
  const days = Math.floor(totalMinutes / (60 * 24))

  const parts = []

  if (days > 0) {
    parts.push(`${days}d`)
  }
  if (hours > 0) {
    parts.push(`${hours}h`)
  }
  if ((minutes > 0 && parts.length < 2) || parts.length === 0) {
    parts.push(`${minutes} min`)
  }
  return parts.join(' ')
}

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

const ONE_HOUR_IN_SECONDS = 60 * 60
const ONE_DAY_IN_SECONDS = ONE_HOUR_IN_SECONDS * 24

function getMidnightXDaysEarlier(unixTimestamp, daysAgo) {
  const sevenDaysAgo = unixTimestamp - (ONE_DAY_IN_SECONDS * daysAgo)
  const midnight = Math.ceil(sevenDaysAgo / ONE_DAY_IN_SECONDS) * ONE_DAY_IN_SECONDS
  return midnight
}

function getHoursEarlier(unixTimestamp, hoursAgo) {
  const nHoursAgo = unixTimestamp - (ONE_HOUR_IN_SECONDS * hoursAgo)
  return nHoursAgo
}

module.exports = {
  ONE_HOUR_IN_SECONDS,
  ONE_DAY_IN_SECONDS,
  formatNumberShort,
  formatTime,
  getHoursEarlier,
  getMidnightXDaysEarlier,
  getSumAverageAmount
}
