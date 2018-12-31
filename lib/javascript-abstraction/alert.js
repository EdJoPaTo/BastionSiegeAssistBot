const MAX_INT = 0x7FFFFFFF

function createAlertAtTimestamp(timestamp, func, now = Date.now()) {
  const inMilliseconds = Math.floor(timestamp - now)
  if (inMilliseconds > MAX_INT) {
    // Skip as there is way to much time in between
    // setTimeout can only handle up to signed 32bit int inMilliseconds (2147483647)
    // that is an equivalent of ~24.8 days
    return
  }
  if (inMilliseconds > 0) {
    return setTimeout(func, inMilliseconds)
  }
}

module.exports = {
  createAlertAtTimestamp
}
