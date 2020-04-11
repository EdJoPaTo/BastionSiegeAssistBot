const allLetters = ['', 'k', 'M', 'B', 'T']

export function formatNumberShort(value: number | undefined, isInteger = false): string {
  if (value === undefined || !Number.isFinite(value)) {
    return 'NaN'
  }

  const isNegative = value < 0
  if (isNegative) {
    value *= -1
  }

  const exponent = value === 0 ? 0 : Math.floor(Math.log10(value))
  const engineerExponentLevel = Math.max(0, Math.floor(exponent / 3))
  const engineerExponent = engineerExponentLevel * 3
  const letter = allLetters[engineerExponentLevel]
  const shortValue = value / (10 ** engineerExponent)

  let fractionDigits = Math.min(2, 3 - (1 + exponent - engineerExponent))
  if (isInteger && engineerExponentLevel === 0) {
    fractionDigits = 0
  }

  const valueString = shortValue.toFixed(fractionDigits)
  return (isNegative ? '-' : '') + valueString + letter
}

export function formatTime(secondsOfDay: number, timeZone: string): string {
  const date = new Date(secondsOfDay * 1000)
  return date.toLocaleTimeString('en-GB', {
    timeZone,
    hour12: false,
    hour: 'numeric',
    minute: '2-digit'
  })
}

export function formatTimeFrame({seconds, stdDeviation}: {seconds: number; stdDeviation: number}, timeZone: string): string {
  const start = seconds - stdDeviation
  const end = seconds + stdDeviation

  let text = ''
  text += formatTime(start, timeZone)

  if (stdDeviation >= 60) {
    text += ' - '
    text += formatTime(end, timeZone)
  }

  return text
}

export function formatTimeAmount(totalMinutes: number): string {
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

export function formatBattleHoursAgo(hoursAgo: number): string {
  let text = ''

  text += '≥'
  if (hoursAgo < 24) {
    text += Math.floor(hoursAgo)
    text += 'h'
  } else {
    text += Math.floor(hoursAgo / 24)
    text += 'd'
  }

  text += ' ago'
  return text
}
