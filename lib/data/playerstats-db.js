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
    const newStats = generate(reports, player)
    playerStats[player] = {
      withReports: reports.length,
      stats: newStats
    }
  }

  return playerStats[player].stats
}

function list() {
  return Object.keys(playerReports)
    .map(name => get(name))
}

module.exports = {
  addReport,
  get,
  list
}
