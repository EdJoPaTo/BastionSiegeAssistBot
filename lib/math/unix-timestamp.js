const angleDistance = require('angle-distance')

const vector = require('./vector')

const {getStdDeviation} = require('./number-array')

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

function getTimeOfDayAsXYCoordinates(unixTimestamp) {
  const secondsOfDay = unixTimestamp % ONE_DAY_IN_SECONDS
  const radian = secondsOfDay / ONE_DAY_IN_SECONDS * 2 * Math.PI
  const coordinates = {
    x: Math.sin(radian),
    y: Math.cos(radian)
  }
  return coordinates
}

function getTimeDifference(baseTime, distantTime) {
  return angleDistance.general(baseTime, distantTime, ONE_DAY_IN_SECONDS)
}

function averageTimeOfDay(unixTimestamps) {
  const secondsOfDay = unixTimestamps
    .map(o => o % ONE_DAY_IN_SECONDS)
  const coordinates = secondsOfDay
    .map(o => getTimeOfDayAsXYCoordinates(o))
  const averageCoordinates = vector.average(coordinates)

  const radian = Math.atan2(averageCoordinates.y, averageCoordinates.x)

  // Bring the x y way to the 'clockwise' way if thinking
  const tmp = (radian - (Math.PI / 2)) * -1
  const seconds = tmp / (2 * Math.PI) * ONE_DAY_IN_SECONDS
  const seconds2 = (seconds + ONE_DAY_IN_SECONDS) % ONE_DAY_IN_SECONDS

  const accuracy = vector.length(averageCoordinates)
  const stdDeviation = getStdDeviation(secondsOfDay, seconds2, getTimeDifference)

  return {
    seconds: seconds2,
    stdDeviation,
    accuracy
  }
}

module.exports = {
  ONE_HOUR_IN_SECONDS,
  ONE_DAY_IN_SECONDS,
  averageTimeOfDay,
  getHoursEarlier,
  getMidnightXDaysEarlier,
  getTimeDifference,
  getTimeOfDayAsXYCoordinates
}
