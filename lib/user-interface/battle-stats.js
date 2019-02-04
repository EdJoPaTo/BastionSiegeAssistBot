const {emoji} = require('./output-text')
const {formatNumberShort} = require('./format-number')
const {createAverageSumString} = require('./number-array-strings')

function createBattleStatsString(stats, selector) {
  let text = ''
  if (stats.reward.sum) {
    text += '\n' + createAverageSumString(stats.reward, '*Total*', emoji[selector], true)
  }

  text += createAlliancesStats(stats.mystics, 'Mystics', emoji[selector], true)

  text += createAlliancesStats(stats.rewardAttackWon, 'Successful Attacks', emoji[selector], true)
  text += createAlliancesStats(stats.rewardDefenseWon, 'Successful Defenses', emoji[selector], true)
  text += createAlliancesStats(stats.rewardAttackLost, 'Lost Attacks', emoji[selector], true)
  text += createAlliancesStats(stats.rewardDefenseLost, 'Lost Defenses', emoji[selector], true)

  return text.trim()
}

function createAlliancesStats(rewards, title, unit, isInteger) {
  if (!rewards.some(o => o.stats.sum)) {
    return ''
  }

  const lines = rewards
    .map(({alliance, stats}) => createAverageSumString(
      stats,
      String(alliance)
        .replace('undefined', '     ')
        .replace('total', '*' + title + '*'),
      unit, isInteger
    ))

  return '\n\n' + lines.join('\n')
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
