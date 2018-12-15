const {getMidnightXDaysEarlier} = require('../math/unix-timestamp')

const userSessions = require('./user-sessions')

const RELEVANT_REPORT_DAYS = 7

function isPoweruser(allBattlereports, id) {
  const minDate = getMidnightXDaysEarlier(Date.now() / 1000, RELEVANT_REPORT_DAYS)
  const relevantReports = allBattlereports
    .filter(o => o.providingTgUser === id)
    .filter(o => o.friends.length === 1) // Solo fights are the main data source so they are valued
    .filter(o => o.time > minDate)

  // Provided at least 5 reports per day
  return relevantReports.length >= RELEVANT_REPORT_DAYS * 5
}

function getPoweruserSessions(allBattlereports) {
  return userSessions.getRaw()
    .filter(o => isPoweruser(allBattlereports, o.user))
}

function getImmunePlayers(allBattlereports) {
  const immunePlayers = getPoweruserSessions(allBattlereports)
    .map(o => o.data)
    .filter(o => !o.disableImmunity)
    .map(o => o.gameInformation || {})
    .map(o => o.player || {})
    .map(o => o.name)
    .filter(o => o)

  return immunePlayers
}

function isImmune(allBattlereports, playername) {
  return getImmunePlayers(allBattlereports).indexOf(playername) >= 0
}

module.exports = {
  getImmunePlayers,
  getPoweruserSessions,
  isImmune,
  isPoweruser
}
