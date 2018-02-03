const allLetters = ['', 'k', 'M', 'B', 'T']

function formatNumberShort(value, isInteger = false) {
  if (!value && value !== 0) { return 'NaN' }

  const exponent = value !== 0 ? Math.ceil(Math.log10(value)) : 0
  const engineerExponentLevel = Math.max(0, Math.floor((exponent - 1) / 3))
  const engineerExponent = engineerExponentLevel * 3
  const letter = allLetters[engineerExponentLevel]
  const shortValue = value / Math.pow(10, engineerExponent)

  let fractionDigits = Math.min(2, 3 - (exponent - engineerExponent))
  if (isInteger && engineerExponentLevel === 0) {
    fractionDigits = 0
  }

  const valueString = shortValue.toFixed(fractionDigits)
  return valueString + letter
}

function formatTime(totalMinutes) {
  const totalHours = Math.floor(totalMinutes / 60)
  const minutes = Math.floor(totalMinutes % 60)

  const days = Math.floor(totalHours / 24)
  const hours = totalHours % 24

  const parts = []

  if (days > 0) {
    parts.push(`${days}d`)
  }
  if (hours > 0) {
    parts.push(`${hours}h`)
  }
  if (minutes > 0 || parts.length === 0) {
    parts.push(`${minutes} min`)
  }
  return parts.join(' ')
}

module.exports = {
  formatNumberShort: formatNumberShort,
  formatTime: formatTime
}
