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
  const text = createPlayerNameString(infos)
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
    text += '\nThis player is an active user of this bot. You will not get any information from me. Do the same and get the same kind of protection. ' + emoji.immunity + emoji.poweruser
    return text
  }

  const strengthLine = []

  if (stats.army.min) {
    strengthLine.push(createArmyStatsBarLine(stats.army))
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
  text += createMultipleStatsPlayerList(side1.alliance, side1stats)

  text += '\n\n'
  text += createMultipleStatsPlayerList(side2.alliance, side2stats)

  return text
}

function createMultipleStatsPlayerList(allianceEmoji, statsArr) {
  const side2immunEntries = statsArr
    .filter(o => isImmune(o.player))
    .map(({player}) => ({player}))
    .map(o => createPlayerNameString(o, true))
  const side2normalEntries = statsArr
    .filter(o => !isImmune(o.player))
    .map(o => createPlayerStatsTwoLineString(o, true))

  let text = ''

  if (side2immunEntries.length > 0) {
    text += `${allianceEmoji}${emoji.poweruser}${emoji.immunity} `
    text += side2immunEntries.join(', ')
  }

  if (side2immunEntries.length > 0 && side2normalEntries.length > 0) {
    text += '\n'
  }

  if (side2normalEntries.length > 0) {
    text += side2normalEntries.join('\n')
  }

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
  createTwoSidesOneLineString,
  createTwoSidesStatsString
}
