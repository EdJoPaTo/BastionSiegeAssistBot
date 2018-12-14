const {ONE_DAY_IN_SECONDS} = require('../math/unix-timestamp')

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

function formatTime(secondsOfDay, includeSeconds = false) {
  const fixedSecondsOfDay = (secondsOfDay + ONE_DAY_IN_SECONDS) % ONE_DAY_IN_SECONDS

  const seconds = Math.floor(fixedSecondsOfDay % 60)
  const totalMinutes = fixedSecondsOfDay / 60
  const minutes = Math.floor(totalMinutes % 60)
  const hour = Math.floor(totalMinutes / 60)

  let text = String(hour)
  text += ':'
  if (minutes < 10) {
    text += '0'
  }
  text += String(minutes)

  if (includeSeconds) {
    text += ':'
    if (seconds < 10) {
      text += '0'
    }
    text += String(seconds)
  }
  return text
}

function formatTimeFrame({seconds, stdDeviation}) {
  const start = seconds - stdDeviation
  const end = seconds + stdDeviation

  let text = ''
  text += formatTime(start)
  if (stdDeviation > 0) {
    text += ' - '
    text += formatTime(end)
  }
  return text
}

function formatTimeAmount(totalMinutes) {
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

module.exports = {
  formatNumberShort,
  formatTime,
  formatTimeAmount,
  formatTimeFrame
}
