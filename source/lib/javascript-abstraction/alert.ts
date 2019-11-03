const MAX_INT = 0x7FFFFFFF

export function createAlertAtTimestamp(timestamp: number, func: () => void, now = Date.now()): NodeJS.Timeout | undefined {
  const inMilliseconds = Math.floor(timestamp - now)
  if (inMilliseconds > MAX_INT) {
    // Skip as there is way to much time in between
    // setTimeout can only handle up to signed 32bit int inMilliseconds (2147483647)
    // that is an equivalent of ~24.8 days
    return undefined
  }

  if (inMilliseconds > 0) {
    return setTimeout(func, inMilliseconds)
  }

  return undefined
}
