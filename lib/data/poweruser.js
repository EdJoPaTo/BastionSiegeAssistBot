const {getHoursEarlier, getMidnightXDaysEarlier} = require('../math/unix-timestamp')

const userSessions = require('./user-sessions')

const MAX_BUILDING_AGE_DAYS = 7
const MAX_PLAYER_AGE_DAYS = 3
const MAX_WORKSHOP_AGE_DAYS = 14
const RELEVANT_REPORT_DAYS = 7

const soloReportsOfUser = {}

function addReport(report) {
  // Only solo reports
  if (report.friends.length > 1) {
    return
  }

  // An old report that is not to be considered
  // This is using the time of adding so it has to be checked later too
  // But this is a good prefilter
  const now = Date.now() / 1000
  if (report.time < getMidnightXDaysEarlier(now, RELEVANT_REPORT_DAYS)) {
    return
  }

  if (!soloReportsOfUser[report.providingTgUser]) {
    soloReportsOfUser[report.providingTgUser] = []
  }

  soloReportsOfUser[report.providingTgUser].push(report)
}

function isPoweruser(id) {
  const conditions = getConditions(id)
    .filter(o => o.required)

  const allTrue = conditions
    .every(o => o.status)
  return allTrue
}

function getConditions(id) {
  const now = Date.now() / 1000
  const {buildingsTimestamp, playerTimestamp, workshopTimestamp} = (userSessions.getUser(id) || {}).gameInformation || {}

  const conditions = []

  conditions.push({
    required: true,
    status: hasSendEnoughReports(id),
    warning: !hasEasilySendEnoughReports(id),
    type: 'battlereports'
  })

  conditions.push({
    required: true,
    status: playerTimestamp && playerTimestamp > getMidnightXDaysEarlier(now, MAX_PLAYER_AGE_DAYS),
    warning: playerTimestamp && playerTimestamp < getMidnightXDaysEarlier(now, 2),
    type: 'name'
  })

  conditions.push({
    required: true,
    status: buildingsTimestamp && buildingsTimestamp > getMidnightXDaysEarlier(now, MAX_BUILDING_AGE_DAYS),
    warning: buildingsTimestamp && buildingsTimestamp < getMidnightXDaysEarlier(now, 4),
    type: 'buildings'
  })

  conditions.push({
    required: false,
    status: workshopTimestamp && workshopTimestamp > getMidnightXDaysEarlier(now, MAX_WORKSHOP_AGE_DAYS),
    warning: workshopTimestamp && workshopTimestamp < getMidnightXDaysEarlier(now, 10),
    type: 'workshop'
  })

  return conditions
}

function getRelevantReports(id) {
  if (!soloReportsOfUser[id]) {
    return []
  }

  const now = Date.now() / 1000

  const minDate = getMidnightXDaysEarlier(now, RELEVANT_REPORT_DAYS)
  soloReportsOfUser[id] = soloReportsOfUser[id]
    .filter(o => o.time > minDate)

  return soloReportsOfUser[id]
}

function hasSendEnoughReports(id) {
  // Provided at least 5 reports per day
  return getRelevantReports(id).length >= RELEVANT_REPORT_DAYS * 5
}

function hasEasilySendEnoughReports(id) {
  const now = Date.now() / 1000
  const minDate = getHoursEarlier(now, 24)
  const reports = getRelevantReports(id)
    .filter(o => o.time > minDate)

  // Provided at least 10 reports within 24h
  return reports.length >= 10
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
  MAX_BUILDING_AGE_DAYS,
  MAX_PLAYER_AGE_DAYS,
  MAX_WORKSHOP_AGE_DAYS,
  RELEVANT_REPORT_DAYS,
  addReport,
  getConditions,
  getPoweruserSessions,
  hasSendEnoughReports,
  isImmune,
  isPoweruser
}
