const {replaceLookingLikeAsciiChars} = require('../javascript-abstraction/strings')

const {generate} = require('../math/player-stats')

const playerReports = {}
const playerStats = {}

function addReport(report) {
  const {enemies} = report

  for (const enemy of enemies) {
    if (!playerReports[enemy]) {
      playerReports[enemy] = []
    }

    playerReports[enemy].push(report)
  }
}

function get(player) {
  const reports = playerReports[player] || []
  const withReports = (playerStats[player] || {}).withReports || 0

  if (withReports < reports.length || !playerStats[player]) {
    // Providing the current time to something that will be cached is strange
    const newStats = generate(reports, player, Date.now() / 1000)
    newStats.playerNameLookingLike = replaceLookingLikeAsciiChars(player)
    playerStats[player] = {
      withReports: reports.length,
      stats: newStats
    }
  }

  return playerStats[player].stats
}

function getLookingLike(player) {
  const searched = replaceLookingLikeAsciiChars(player)
  return list().filter(o => o.playerNameLookingLike === searched)
}

function list() {
  return Object.keys(playerReports)
    .map(name => get(name))
}

module.exports = {
  addReport,
  get,
  getLookingLike,
  list
}
