const {Markup} = require('telegraf')

const {ONE_HOUR_IN_SECONDS} = require('../math/unix-timestamp')
const {getSumAverageAmount} = require('../math/number-array')
const {calcBarracksNeeded} = require('../math/siegemath')

const {isImmune} = require('../data/poweruser')

const {emoji} = require('./output-text')
const {createAverageMaxString, formatTypeOfData} = require('./number-array-strings')
const {formatTimeFrame} = require('./format-number')

function createPlayerShareButton(infos) {
  const {player} = infos
  let text = 'Share '
  text += createPlayerNameString(infos)
  text += '…'
  return Markup.switchToChatButton(text, player)
}

function createPlayerNameString({player, alliance}, markdown) {
  let text = ''
  if (alliance) {
    text += alliance + ' '
  }

  if (markdown) {
    text += '*'
    text += player
      .replace(/\*/g, '•')
    text += '*'
  } else {
    text += player
  }

  return text
}

function createPlayerStatsString(stats) {
  let text = createPlayerNameString(stats, true)

  if (isImmune(stats.player)) {
    text += '\nThis player is an active user of this bot. You will not get any information from me. Do the same and get the same kind of protection. 🛡💙'
    return text
  }

  if (stats.army.min) {
    text += '\n' + createArmyStatsBarLine(stats.army)
  }

  text += `\nBattles observed: ${stats.battlesObserved}`
  const hoursAgo = ((Date.now() / 1000) - stats.lastBattleTime) / ONE_HOUR_IN_SECONDS
  if (isFinite(hoursAgo)) {
    text += ' (≥'
    if (hoursAgo < 24) {
      text += Math.floor(hoursAgo)
      text += 'h'
    } else {
      text += Math.floor(hoursAgo / 24)
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

function createArmyStatsBarLine(data) {
  if (!isFinite(data.min)) {
    return '?????' + emoji.army
  }

  let text = ''
  text += `${data.min}${emoji.army}`
  text += ` (${emoji.barracks}${calcBarracksNeeded(data.min)})`

  return text
}

function createPlayerStatsTwoLineString(stats, markdown) {
  let text = createPlayerNameString(stats, markdown)
  text += '\n  '

  if (isImmune(stats.player)) {
    text += 'Active user of this bot. 🛡💙'
    return text
  }

  const infos = []

  infos.push(
    createArmyStatsBarLine(stats.army)
  )

  if (stats.loot.amount > 0) {
    infos.push(
      formatTypeOfData(stats.loot, 'max', true) + emoji.gold
    )
  }

  text += infos.join('  ')
  return text
}

function createPlayerStatsShortString(stats) {
  let text = ''

  if (isImmune(stats.player)) {
    text += '🛡💙 This player is an active user of this bot. You will not get any information from me.'
    return text
  }

  text += ` ${stats.battlesObserved} battle${stats.battlesObserved > 1 ? 's' : ''} observed.`

  if (stats.attacksWithoutLossPercentage >= 0) {
    text += ` Inactive: ${Math.round(stats.attacksWithoutLossPercentage * 100)}%.`
  }

  if (stats.loot.amount > 0) {
    text += ' ' + createAverageMaxString(stats.loot, 'Loot', emoji.gold, true)
  }

  return text.trim()
}

function createTwoSidesStatsString(side1stats, side2stats, playerArmyOverride = {}) {
  const side1 = createMultipleStatsConclusion(side1stats, playerArmyOverride)
  const side2 = createMultipleStatsConclusion(side2stats, playerArmyOverride)

  let text = ''
  text += side1.armyString
  text += '\n'
  text += side2.armyString

  text += '\n\n'
  text += side1stats
    .map(o => createPlayerStatsTwoLineString(o, true))
    .join('\n')

  text += '\n\n'
  text += side2stats
    .map(o => createPlayerStatsTwoLineString(o, true))
    .join('\n')

  return text
}

function createMultipleStatsConclusion(statsArr, playerArmyOverride = {}) {
  const alliance = statsArr
    .map(o => o.alliance)
    .filter(o => o)[0] || '❓'

  const armyArr = statsArr
    .map(o => {
      if (playerArmyOverride[o.player]) {
        return playerArmyOverride[o.player]
      }

      if (isImmune(o.player)) {
        return NaN
      }

      return o.army.min
    })
  const army = getSumAverageAmount(armyArr)
  army.amount = armyArr.length
  army.sum = army.amount * army.avg

  const avgString = formatTypeOfData(army, 'avg', false) + emoji.army
  const sumString = formatTypeOfData(army, 'sum', false) + emoji.army
  const armyString = `${alliance} ${army.amount}x ${avgString} ${sumString}`

  return {
    alliance,
    army,
    armyString
  }
}

module.exports = {
  createPlayerShareButton,
  createPlayerNameString,
  createPlayerStatsString,
  createPlayerStatsTwoLineString,
  createPlayerStatsShortString,
  createTwoSidesStatsString
}
