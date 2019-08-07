const {Markup} = require('telegraf')
const {calcBarracksNeeded} = require('bastion-siege-logic')

const {ONE_HOUR_IN_SECONDS} = require('../math/unix-timestamp')
const {getSumAverageAmount} = require('../math/number-array')

const {isImmune} = require('../data/poweruser')

const {emoji} = require('./output-text')
const {createAverageMaxString, formatTypeOfData} = require('./number-array-strings')
const {formatNumberShort, formatTimeFrame} = require('./format-number')

function createPlayerShareButton(infos) {
  const {player} = infos
  const text = createPlayerNameString(infos)
  return Markup.switchToChatButton(text, player)
}

function createPlayerMarkdownLink(user, {player, alliance}) {
  let namePart = ''
  if (alliance) {
    namePart += alliance + ' '
  }

  namePart += player

  const idPart = `tg://user?id=${user}`

  return `[${namePart}](${idPart})`
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
    text += '\nThis player is an active user of this bot. You will not get any information from me. Do the same and get the same kind of protection. ' + emoji.immunity + emoji.poweruser
    return text
  }

  const allianceHistoryToShow = stats.allAlliances.filter(o => o)
  if (allianceHistoryToShow.filter(o => o !== stats.alliance).length > 0) {
    text += ` (${allianceHistoryToShow.join('')})`
  }

  const strengthLine = []

  if (stats.army.min) {
    strengthLine.push(createArmyStatsBarLine(stats.army))
  }

  if (isFinite(stats.terra)) {
    strengthLine.push(formatNumberShort(stats.terra, true) + emoji.terra)
  }

  if (strengthLine.length > 0) {
    text += '\n' + strengthLine.join(' ')
  }

  const randomFacs = []
  randomFacs.push(`${stats.battlesObserved}${emoji.battlereport}`)

  const hoursAgo = ((Date.now() / 1000) - stats.lastBattleTime) / ONE_HOUR_IN_SECONDS
  if (isFinite(hoursAgo)) {
    let timestring = '≥'
    if (hoursAgo < 24) {
      timestring += Math.floor(hoursAgo)
      timestring += 'h'
    } else {
      timestring += Math.floor(hoursAgo / 24)
      timestring += 'd'
    }

    timestring += ' ago'
    randomFacs.push(timestring)
  }

  if (stats.loot.amount > 0) {
    randomFacs.push(formatTypeOfData(stats.loot, 'max', true) + emoji.gold)
  }

  if (stats.gems.amount > 0) {
    randomFacs.push(formatTypeOfData(stats.gems, 'max', true) + emoji.gems)
  }

  text += '\n' + randomFacs.join('  ')

  if (stats.activeTime.accuracy > 0 || stats.lootActive.amount > 0) {
    const parts = []
    parts.push(emoji.active)

    if (stats.lootActive.amount > 0) {
      parts.push(formatTypeOfData(stats.lootActive, 'avg', false) + emoji.gold)
    }

    if (stats.gems.amount > 0) {
      parts.push(formatTypeOfData(stats.gems, 'avg', false) + emoji.gem)
    }

    if (stats.activeTime.accuracy > 0) {
      parts.push(formatTimeFrame(stats.activeTime))
    }

    text += '\n' + parts.join(' ')
  }

  if (stats.attacksWithoutLossPercentage > 0) {
    const parts = []
    parts.push(emoji.inactive)
    parts.push(formatTypeOfData(stats.lootInactive, 'avg', false) + emoji.gold)

    if (stats.attacksWithoutLossPercentage < 1 && stats.inactiveTime.accuracy > 0) {
      parts.push(formatTimeFrame(stats.inactiveTime))
    }

    parts.push(`${emoji.losslessBattle}${Math.round(stats.attacksWithoutLossPercentage * 100)}%`)

    text += '\n' + parts.join(' ')
  }

  return text
}

function createArmyStatsBarLine(data) {
  if (!isFinite(data.min)) {
    return '?????' + emoji.army
  }

  let text = ''
  text += `${data.min}${emoji.army}`
  text += ` (${calcBarracksNeeded(data.min)}${emoji.barracks})`

  return text
}

function createPlayerStatsTwoLineString(stats, markdown) {
  let text = createPlayerNameString(stats, markdown)
  text += '\n  '

  if (isImmune(stats.player)) {
    text += 'Active user of this bot. ' + emoji.immunity + emoji.poweruser
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
    text += emoji.immunity + emoji.poweruser + ' This player is an active user of this bot. You will not get any information from me.'
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

function createTwoSidesArmyStrengthString(side1stats, side2stats, playerArmyOverride = {}) {
  const side1 = createMultipleStatsConclusion(side1stats, playerArmyOverride)
  const side2 = createMultipleStatsConclusion(side2stats, playerArmyOverride)

  let text = ''
  text += side1.armyString
  text += '\n'
  text += side2.armyString

  return text
}

function createTwoSidesOneLineString(side1stats, side2stats) {
  const side1 = createMultipleStatsConclusion(side1stats)
  const side2 = createMultipleStatsConclusion(side2stats)

  let text = ''
  text += side1.alliance
  text += side1stats.length
  text += ' | '
  text += side2stats.length
  text += side2.alliance

  return text
}

function createTwoSidesStatsString(side1stats, side2stats, playerArmyOverride = {}) {
  const side1 = createMultipleStatsConclusion(side1stats, playerArmyOverride)
  const side2 = createMultipleStatsConclusion(side2stats, playerArmyOverride)

  let text = ''
  text += createTwoSidesArmyStrengthString(side1stats, side2stats, playerArmyOverride)

  text += '\n\n'
  text += createMultipleStatsPlayerList(side1.alliance, side1stats, Object.keys(playerArmyOverride))

  text += '\n\n'
  text += createMultipleStatsPlayerList(side2.alliance, side2stats, Object.keys(playerArmyOverride))

  return text
}

function createMultipleStatsPlayerList(allianceEmoji, statsArr, playerNamesOverridden) {
  const immuneEntries = statsArr
    .filter(o => isImmune(o.player))
    .map(o => o.player)
  const overriddenEntries = statsArr
    .filter(o => playerNamesOverridden.includes(o.player))
    .filter(o => !immuneEntries.includes(o.player))
    .map(o => o.player)
  const normalEntries = statsArr
    .filter(o => !immuneEntries.includes(o.player))
    .filter(o => !overriddenEntries.includes(o.player))

  const textParts = []

  if (normalEntries.length > 0) {
    textParts.push(normalEntries
      .map(o => createPlayerStatsTwoLineString(o, true))
      .join('\n')
    )
  }

  if (immuneEntries.length > 0) {
    let text = ''
    text += allianceEmoji
    text += emoji.poweruser
    text += emoji.immunity
    text += ' '
    text += immuneEntries
      .map(o => createPlayerNameString({player: o}, true))
      .join(', ')

    textParts.push(text)
  }

  if (overriddenEntries.length > 0) {
    let text = ''
    text += allianceEmoji
    text += ' '
    text += overriddenEntries
      .map(o => createPlayerNameString({player: o}, true))
      .join(', ')

    textParts.push(text)
  }

  return textParts.join('\n')
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
  createMultipleStatsConclusion,
  createPlayerMarkdownLink,
  createPlayerNameString,
  createPlayerShareButton,
  createPlayerStatsShortString,
  createPlayerStatsString,
  createPlayerStatsTwoLineString,
  createTwoSidesOneLineString,
  createTwoSidesStatsString
}
