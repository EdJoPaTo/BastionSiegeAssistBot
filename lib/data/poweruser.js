const {getMidnightXDaysEarlier} = require('../math/unix-timestamp')

const userSessions = require('./user-sessions')

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
  const minDate = getMinDate()
  const userReports = soloReportsOfUser[id] || []
  const relevantReports = userReports
    .filter(o => o.time > minDate)

  // Provided at least 5 reports per day
  return relevantReports.length >= RELEVANT_REPORT_DAYS * 5
}

function getPoweruserSessions() {
  return userSessions.getRaw()
    .filter(o => isPoweruser(o.user))
}

function getImmunePlayers() {
  const immunePlayers = getPoweruserSessions()
    .map(o => o.data)
    .filter(o => !o.disableImmunity)
    .map(o => o.gameInformation || {})
    .map(o => o.player || {})
    .map(o => o.name)
    .filter(o => o)

  return immunePlayers
}

function isImmune(playername) {
  return getImmunePlayers().indexOf(playername) >= 0
}

module.exports = {
  addReport,
  getImmunePlayers,
  getPoweruserSessions,
  isImmune,
  isPoweruser
}
