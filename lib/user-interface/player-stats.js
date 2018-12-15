const {ONE_HOUR_IN_SECONDS} = require('../math/unix-timestamp')

const {emoji} = require('./output-emojis')
const {createAverageMaxString} = require('./number-array-strings')
const {formatTimeFrame} = require('./format-number')

function createPlayerStatsString(stats) {
  let text = `*${stats.player}*`

  if (stats.immune) {
    text += '\nThis player is an active user of this bot. You will not get any information from me. Do the same and get the same kind of protection. 🛡💙'
    return text
  }

  text += createArmyStatsBarLine(stats.armyAttack, emoji.army)
  text += createArmyStatsBarLine(stats.armyDefense, emoji.wall)

  text += `\nBattles observed: ${stats.battlesObserved}`
  const hoursAgo = ((Date.now() / 1000) - stats.lastBattleTime) / ONE_HOUR_IN_SECONDS
  if (isFinite(hoursAgo)) {
    text += ' (≥'
    if (hoursAgo < 24) {
      text += Math.round(hoursAgo)
      text += 'h'
    } else {
      text += Math.round(hoursAgo / 24)
      text += 'd'
    }
    text += ' ago)'
  }

  if (stats.activeTime.accuracy > 0) {
    text += '\nActive Time: ' + formatTimeFrame(stats.activeTime)
  }
  if (stats.attacksWithoutLossPercentage >= 0) {
    text += `\nInactive: ${Math.round(stats.attacksWithoutLossPercentage * 100)}%`
    if (stats.attacksWithoutLossPercentage < 1 && stats.inactiveTime.accuracy > 0) {
      text += '  ' + formatTimeFrame(stats.inactiveTime)
    }
  }

  if (stats.loot.amount > 0) {
    text += '\n' + createAverageMaxString(stats.loot, 'Loot', emoji.gold, true)
  }
  if (stats.gems.amount > 0) {
    text += '\n' + createAverageMaxString(stats.gems, 'Gems', emoji.gem, true)
  }

  return text
}

function createArmyStatsBarLine(data, armyTypeEmoji) {
  let text = ''
  if (!data.min && !data.max) {
    return text
  }
  text += '\n'

  text += isFinite(data.min) ? data.min : '?????'

  text += ` < ${armyTypeEmoji} < `

  if (isFinite(data.max)) {
    text += data.max
    text += ' ('
    text += `${Math.round(data.maxPercentLost * 100)}%${emoji.army} lost`
    text += ')'
  } else {
    text += '?????'
  }
  return text
}

function createPlayerStatsShortString(stats) {
  let text = ''

  if (stats.immune) {
    text += '🛡💙 This player is an active user of this bot. You will not get any information from me.'
    return text
  }

  text += ` ${stats.battlesObserved} battle${stats.battlesObserved > 1 ? 's' : ''} observed (${stats.winsObserved}|${stats.lossesObserved}).`
  if (stats.attacksWithoutLossPercentage >= 0) {
    text += ` Inactive: ${Math.round(stats.attacksWithoutLossPercentage * 100)}%.`
  }
  if (stats.loot.amount > 0) {
    text += ' ' + createAverageMaxString(stats.loot, 'Loot', emoji.gold, true)
  }

  return text.trim()
}

module.exports = {
  createPlayerStatsString,
  createPlayerStatsShortString
}
