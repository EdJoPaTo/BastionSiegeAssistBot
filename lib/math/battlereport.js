function uniqueBattlereportIdentifier(report) {
  const time = Math.floor(report.time / 60)
  return `${time} ${report.friends[0]} ${report.enemies[0]}`
}

module.exports = {
  uniqueBattlereportIdentifier
}
