const {emoji} = require('./output-text')
const {formatNumberShort} = require('./format-number')
const {createAverageSumString} = require('./number-array-strings')

function createBattleStatsString(stats) {
  let text = ''
  text += '\n' + createAverageSumString(stats.reward, '*Total*', emoji.gold, true)
  text += '\n' + createAverageSumString(stats.karma, 'Karma', emoji.karma, true)
  text += '\n' + createAverageSumString(stats.terra, 'Terra', emoji.terra, true)

  text += '\n'
  text += '\n' + createAlliancesStats(stats.mystics, 'Mystics', emoji.gold, true)
  text += '\n' + createAverageSumString(stats.gems, 'Gems', emoji.gem, true)

  text += '\n'
  text += '\n' + createAlliancesStats(stats.rewardAttackWon, 'Successful Attacks', emoji.gold, true)
  text += '\n'
  text += '\n' + createAlliancesStats(stats.rewardDefenseWon, 'Successful Defenses', emoji.gold, true)
  text += '\n'
  text += '\n' + createAlliancesStats(stats.rewardAttackLost, 'Lost Attacks', emoji.gold, true)
  text += '\n'
  text += '\n' + createAlliancesStats(stats.rewardDefenseLost, 'Lost Defenses', emoji.gold, true)

  return text.trim()
}

function createAlliancesStats(rewards, title, unit, isInteger) {
  const lines = rewards
    .map(({alliance, stats}) => createAverageSumString(
      stats,
      String(alliance)
        .replace('undefined', '     ')
        .replace('total', '*' + title + '*'),
      unit, isInteger
    ))

  return lines.join('\n')
}

function createSingleBattleShortStatsLine(report) {
  const {attack, won, terra, gold, gems, karma, soldiersAlive, soldiersTotal} = report
  let text = ''

  text += attack ? emoji.army : emoji.wall
  text += won ? emoji.win : emoji.lose
  text += ' '
  const additionalStats = []
  additionalStats.push(formatNumberShort(gold, true) + emoji.gold)

  if (gems) {
    additionalStats.push(formatNumberShort(gems, true) + emoji.gem)
  }

  if (terra) {
    additionalStats.push(formatNumberShort(terra, true) + emoji.terra)
  }

  if (karma) {
    additionalStats.push(formatNumberShort(karma, true) + emoji.karma)
  }

  if (soldiersAlive < soldiersTotal) {
    additionalStats.push(formatNumberShort(soldiersAlive - soldiersTotal, true) + emoji.army)
  }

  text += additionalStats.join(' ')

  return text
}

module.exports = {
  createBattleStatsString,
  createSingleBattleShortStatsLine
}
