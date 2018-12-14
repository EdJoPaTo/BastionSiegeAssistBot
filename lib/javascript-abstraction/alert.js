function createAlertAtTimestamp(timestamp, func, now = Date.now()) {
  const inMilliseconds = Math.floor(timestamp - now)
  if (inMilliseconds > 0) {
    return setTimeout(func, inMilliseconds)
  }
}

module.exports = {
  createAlertAtTimestamp
}
