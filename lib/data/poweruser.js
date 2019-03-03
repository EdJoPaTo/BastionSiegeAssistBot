const {getMidnightXDaysEarlier} = require('../math/unix-timestamp')

const userSessions = require('./user-sessions')

const MAX_BUILDING_AGE_DAYS = 7
const MAX_PLAYER_AGE_DAYS = 7
const RELEVANT_REPORT_DAYS = 7

const soloReportsOfUser = {}

function getMinDate() {
  return getMidnightXDaysEarlier(Date.now() / 1000, RELEVANT_REPORT_DAYS)
}

function addReport(report) {
  // Only solo reports
  if (report.friends.length > 1) {
    return
  }

  // An old report that is not to be considered
  // This is using the time of adding so it has to be checked later too
  // But this is a good prefilter
  if (report.time < getMinDate()) {
    return
  }

  if (!soloReportsOfUser[report.providingTgUser]) {
    soloReportsOfUser[report.providingTgUser] = []
  }

  soloReportsOfUser[report.providingTgUser].push(report)
}

function isPoweruser(id) {
  const now = Date.now() / 1000

  if (!hasSendEnoughReports(id)) {
    return false
  }

  const {buildingsTimestamp, playerTimestamp} = (userSessions.getUser(id) || {}).gameInformation || {}

  if (!playerTimestamp || playerTimestamp < getMidnightXDaysEarlier(now, MAX_PLAYER_AGE_DAYS)) {
    return false
  }

  if (!buildingsTimestamp || buildingsTimestamp < getMidnightXDaysEarlier(now, MAX_BUILDING_AGE_DAYS)) {
    return false
  }

  return true
}

function hasSendEnoughReports(id) {
  if (!soloReportsOfUser[id]) {
    return false
  }

  const minDate = getMinDate()
  soloReportsOfUser[id] = soloReportsOfUser[id]
    .filter(o => o.time > minDate)

  // Provided at least 5 reports per day
  return soloReportsOfUser[id].length >= RELEVANT_REPORT_DAYS * 5
}

function getPoweruserSessions() {
  return userSessions.getRaw()
    .filter(o => isPoweruser(o.user))
}

function isImmune(playername) {
  const id = userSessions.getUserIdByName(playername)

  if (!isPoweruser(id)) {
    return false
  }

  const session = userSessions.getUser(id)
  if (session.disableImmunity) {
    return false
  }

  return true
}

module.exports = {
  addReport,
  getPoweruserSessions,
  hasSendEnoughReports,
  isImmune,
  isPoweruser
}
