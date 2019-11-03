export const MINUTE_IN_SECONDS = 60
export const HOUR_IN_SECONDS = 60 * MINUTE_IN_SECONDS
export const DAY_IN_SECONDS = 24 * HOUR_IN_SECONDS

export function calculateSecondsFromTimeframeString(timeframe: string): number {
  const match = /(\d+) ?(\w+)/.exec(timeframe)

  if (!match) {
    throw new Error('no match')
  }

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
