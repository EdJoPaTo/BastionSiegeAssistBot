const {emoji} = require('./output-emojis')
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

module.exports = {
  createBattleStatsString
}
