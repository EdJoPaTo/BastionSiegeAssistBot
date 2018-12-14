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
  getHoursEarlier,
  getMidnightXDaysEarlier
}
