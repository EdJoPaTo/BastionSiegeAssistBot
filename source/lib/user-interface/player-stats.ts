import {Markup, SwitchToChatButton} from 'telegraf'
import {calcBarracksNeeded} from 'bastion-siege-logic'

import {Player, PlayerStats, ArmyEstimate} from '../types'

import {ONE_HOUR_IN_SECONDS} from '../math/unix-timestamp'
import {getSumAverageAmount, SumAverageAmount} from '../math/number-array'

import {isImmune} from '../data/poweruser'

import {emoji} from './output-text'
import {createAverageMaxString, formatTypeOfData} from './number-array-strings'
import {formatNumberShort, formatTimeFrame, formatBattleHoursAgo} from './format-number'

interface MultipleStatsConclusion {
  alliance: string;
  army: SumAverageAmount;
  armyString: string;
}

export function createPlayerShareButton(infos: Player): SwitchToChatButton {
  const {player} = infos
  const text = createPlayerNameString(infos, false)
  return Markup.switchToChatButton(text, player)
}

export function createPlayerMarkdownLink(user: number, {player, alliance}: Player): string {
  let namePart = ''
  if (alliance) {
    namePart += alliance + ' '
  }

  namePart += player

  const idPart = `tg://user?id=${user}`

  return `[${namePart}](${idPart})`
}

export function createPlayerNameString({player, alliance}: Player, markdown: boolean): string {
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

export function createPlayerStatsString(stats: PlayerStats): string {
  const now = Date.now() / 1000
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
  randomFacs.push(`${stats.battlesObservedNearPast}${emoji.battlereport}`)

  const hoursAgo = (now - stats.lastBattleTime) / ONE_HOUR_IN_SECONDS
  if (isFinite(hoursAgo)) {
    randomFacs.push(formatBattleHoursAgo(hoursAgo))
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

    if (isFinite(stats.lastTimeObservedActive)) {
      parts.push(formatBattleHoursAgo((now - stats.lastTimeObservedActive) / ONE_HOUR_IN_SECONDS))
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

    if (isFinite(stats.lastTimeObservedInactive)) {
      parts.push(formatBattleHoursAgo((now - stats.lastTimeObservedInactive) / ONE_HOUR_IN_SECONDS))
    }

    if (stats.attacksWithoutLossPercentage < 1 && stats.inactiveTime.accuracy > 0) {
      parts.push(formatTimeFrame(stats.inactiveTime))
    }

    parts.push(`${emoji.losslessBattle}${Math.round(stats.attacksWithoutLossPercentage * 100)}%`)

    text += '\n' + parts.join(' ')
  }

  return text
}

function createArmyStatsBarLine(data: ArmyEstimate): string {
  if (!data.min || !isFinite(data.min)) {
    return '?????' + emoji.army
  }

  let text = ''
  text += `${data.min}${emoji.army}`
  text += ` (${calcBarracksNeeded(data.min)}${emoji.barracks})`

  return text
}

export function createPlayerStatsTwoLineString(stats: PlayerStats, markdown: boolean): string {
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

export function createPlayerStatsShortString(stats: PlayerStats): string {
  let text = ''

  if (isImmune(stats.player)) {
    text += emoji.immunity + emoji.poweruser + ' This player is an active user of this bot. You will not get any information from me.'
    return text
  }

  text += ` ${stats.battlesObservedNearPast} battle${stats.battlesObserved > 1 ? 's' : ''} observed.`

  if (stats.attacksWithoutLossPercentage >= 0) {
    text += ` Inactive: ${Math.round(stats.attacksWithoutLossPercentage * 100)}%.`
  }

  if (stats.loot.amount > 0) {
    text += ' ' + createAverageMaxString(stats.loot, 'Loot', emoji.gold, true)
  }

  return text.trim()
}

function createTwoSidesArmyStrengthString(side1stats: readonly PlayerStats[], side2stats: readonly PlayerStats[], playerArmyOverride: Record<string, number>): string {
  const side1 = createMultipleStatsConclusion(side1stats, playerArmyOverride)
  const side2 = createMultipleStatsConclusion(side2stats, playerArmyOverride)

  let text = ''
  text += side1.armyString
  text += '\n'
  text += side2.armyString

  return text
}

export function createTwoSidesOneLineString(side1stats: readonly PlayerStats[], side2stats: readonly PlayerStats[]): string {
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

export function createTwoSidesStatsString(side1stats: readonly PlayerStats[], side2stats: readonly PlayerStats[], playerArmyOverride: Record<string, number> = {}): string {
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

function createMultipleStatsPlayerList(allianceEmoji: string, statsArr: readonly PlayerStats[], playerNamesOverridden: readonly string[]): string {
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

export function createMultipleStatsConclusion(statsArr: readonly PlayerStats[], playerArmyOverride: Record<string, number> = {}): MultipleStatsConclusion {
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
