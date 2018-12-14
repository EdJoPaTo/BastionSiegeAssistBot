const {emoji} = require('./output-emojis')
const {formatNumberShort} = require('./format-number')
const {createAverageSumString} = require('./number-array-strings')

function createBattleStatsString(stats) {
  let text = ''
  text += '\n' + createAverageSumString(stats.reward, 'Rewards', emoji.gold, true)
  text += '\n' + createAverageSumString(stats.rewardAlliance, 'Alliance Battles', emoji.gold, true)

  text += '\n'
  text += '\n' + createAverageSumString(stats.rewardAttackWon, 'Successful Attacks', emoji.gold, true)
  text += '\n' + createAverageSumString(stats.rewardDefenseWon, 'Successful Defenses', emoji.gold, true)
  text += '\n' + createAverageSumString(stats.rewardAttackLost, 'Lost Attacks', emoji.gold, true)
  text += '\n' + createAverageSumString(stats.rewardDefenseLost, 'Lost Defenses', emoji.gold, true)

  text += '\n'
  text += '\n' + createAverageSumString(stats.karma, 'Karma', emoji.karma, true)
  text += '\n' + createAverageSumString(stats.terra, 'Terra', emoji.terra, true)

  text += '\n'
  text += '\n' + createAverageSumString(stats.rewardDragon, 'Dragon', emoji.gold, true)
  text += '\n' + createAverageSumString(stats.rewardUndead, 'Undead', emoji.gold, true)
  text += '\n' + createAverageSumString(stats.gems, 'Gems', emoji.gem, true)

  return text.trim()
}

function createSingleBattleShortStatsLine(report) {
  const {attack, won, terra, reward, gems, karma} = report
  let text = ''

  text += attack ? emoji.army : emoji.wall
  text += won ? '🎉' : '😭'
  text += ' '
  const additionalStats = []
  additionalStats.push(formatNumberShort(reward, true) + emoji.gold)
  if (gems) {
    additionalStats.push(formatNumberShort(gems, true) + emoji.gem)
  }
  if (terra) {
    additionalStats.push(formatNumberShort(terra, true) + emoji.terra)
  }
  if (karma) {
    additionalStats.push(formatNumberShort(karma, true) + emoji.karma)
  }
  text += additionalStats.join(' ')

  return text
}

module.exports = {
  createBattleStatsString,
  createSingleBattleShortStatsLine
}
