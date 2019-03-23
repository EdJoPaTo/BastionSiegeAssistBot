const MINUTE_IN_SECONDS = 60
const HOUR_IN_SECONDS = 60 * MINUTE_IN_SECONDS
const DAY_IN_SECONDS = 24 * HOUR_IN_SECONDS

function calculateSecondsFromTimeframeString(timeframe) {
  const match = timeframe.match(/(\d+) ?(\w+)/)

  if (match[2] === 'min') {
    return Number(match[1]) * MINUTE_IN_SECONDS
  }

  if (match[2] === 'h') {
    return Number(match[1]) * HOUR_IN_SECONDS
  }

  if (match[2] === 'd') {
    return Number(match[1]) * DAY_IN_SECONDS
  }

  throw new Error('unknown unit')
}

module.exports = {
  MINUTE_IN_SECONDS,
  HOUR_IN_SECONDS,
  DAY_IN_SECONDS,
  calculateSecondsFromTimeframeString
}
