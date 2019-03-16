function sameBattleResourceAssumption(reports, resource = 'gold') {
  // In lost alliance battles everyone loses a different amount
  // With this the known values are extrapolated
  // Assumes the reports are of the same battle

  const participants = reports[0].friends.length
  const sum = reports
    .map(o => o[resource])
    .reduce((a, b) => a + b, 0)

  const average = sum / reports.length
  const assumption = average * participants
  return assumption
}

function uniqueBattlereportIdentifier(report) {
  const time = Math.floor(report.time / 60)
  return `${time} ${report.friends[0]} ${report.enemies[0]}`
}

module.exports = {
  sameBattleResourceAssumption,
  uniqueBattlereportIdentifier
}
