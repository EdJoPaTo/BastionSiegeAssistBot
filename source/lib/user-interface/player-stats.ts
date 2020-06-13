import {calcBarracksNeeded} from 'bastion-siege-logic'
import {Markup} from 'telegraf'
import {SwitchToChatButton} from 'telegraf/typings/markup'
import arrayFilterUnique from 'array-filter-unique'

import {Player, PlayerStats} from '../types'

import {ONE_HOUR_IN_SECONDS} from '../math/unix-timestamp'
import {getSumAverageAmount, SumAverageAmount} from '../math/number-array'

import {isImmune} from '../data/poweruser'

import {emoji} from './output-text'
import {createAverageMaxString, createSimpleDataString} from './number-array-strings'
import {formatNumberShort, formatTimeFrame, formatBattleHoursAgo} from './format-number'

interface MultipleStatsConclusion {
  readonly alliance: string;
  readonly army: SumAverageAmount;
  readonly armyString: string;
}

export function createPlayerShareButton(infos: Player): SwitchToChatButton {
  const {player} = infos
  const text = createPlayerNameString(infos, false)
  return Markup.switchToChatButton(text, player)
}

export function createPlayerMarkdownLink(user: number, {player, alliance}: Player): string {
  let namePart = ''
  if (alliance) {
    namePart += alliance
  }

  namePart += player

  const idPart = `tg://user?id=${user}`

  return `[${namePart}](${idPart})`
}

export function createPlayerNameString({player, alliance}: Player, markdown: boolean): string {
  let text = ''
  if (alliance) {
    text += alliance
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

export function createPlayerStatsString(stats: PlayerStats, timeZone: string): string {
  const now = Date.now() / 1000
  let text = createPlayerNameString(stats, true)

  if (isImmune(stats.player)) {
    text += '\nThis player is an active user of this bot. You will not get any information from me. Do the same and get the same kind of protection. ' + emoji.immunity + emoji.poweruser
    return text
  }

  const allianceHistoryToShow = stats.allAlliances
    .filter(o => o)
    .filter(o => o !== stats.alliance)
    .reverse()
    .filter(arrayFilterUnique())
  if (allianceHistoryToShow.length > 0) {
    text += ` (${allianceHistoryToShow.join('')})`
  }

  const strengthLine = []

  if (!stats.seemsCanned) {
    strengthLine.push(createArmyStatsPart(stats.army, true))
  }

  if (Number.isFinite(stats.terra)) {
    strengthLine.push(formatNumberShort(stats.terra, true) + emoji.terra)
  }

  if (strengthLine.length > 0) {
    text += '\n' + strengthLine.join(' ')
  }

  const randomFacs = []
  randomFacs.push(`${stats.battlesObservedNearPast}${emoji.battlereport}`)

  const hoursAgo = (now - stats.lastBattleTime) / ONE_HOUR_IN_SECONDS
  if (Number.isFinite(hoursAgo)) {
    randomFacs.push(formatBattleHoursAgo(hoursAgo))
  }

  if (!stats.seemsCanned && stats.loot.amount > 0) {
    randomFacs.push(createSimpleDataString(stats.loot, emoji.gold, ['avg', 'max'], true))
  }

  if (stats.gems.amount > 0) {
    randomFacs.push(createSimpleDataString(stats.gems, emoji.gems, ['avg', 'max'], true))
  }

  text += '\n' + randomFacs.join('  ')

  if (!stats.seemsCanned && stats.activeTime.accuracy > 0) {
    const parts = []
    parts.push(emoji.active)

    if (Number.isFinite(stats.lastTimeObservedActive)) {
      parts.push(formatBattleHoursAgo((now - stats.lastTimeObservedActive) / ONE_HOUR_IN_SECONDS))
    }

    if (stats.activeTime.accuracy > 0) {
      parts.push(formatTimeFrame(stats.activeTime, timeZone))
    }

    text += '\n' + parts.join(' ')
  }

  if (!stats.seemsCanned && stats.attacksWithoutLossPercentage < 1) {
    const parts = []
    parts.push(emoji.wall + emoji.activityUnclear)

    if (Number.isFinite(stats.lastTimeObservedActivityUnclear)) {
      parts.push(formatBattleHoursAgo((now - stats.lastTimeObservedActivityUnclear) / ONE_HOUR_IN_SECONDS))
    }

    text += '\n' + parts.join(' ')
  }

  if (!stats.seemsCanned && stats.attacksWithoutLossPercentage > 0) {
    const parts = []
    parts.push(emoji.wall + emoji.inactive)

    if (Number.isFinite(stats.lastTimeObservedInactive)) {
      parts.push(formatBattleHoursAgo((now - stats.lastTimeObservedInactive) / ONE_HOUR_IN_SECONDS))
    }

    if (stats.attacksWithoutLossPercentage < 1 && stats.inactiveTime.accuracy > 0) {
      parts.push(formatTimeFrame(stats.inactiveTime, timeZone))
    }

    parts.push(`${emoji.losslessBattle}${Math.round(stats.attacksWithoutLossPercentage * 100)}%`)

    text += '\n' + parts.join(' ')
  }

  if (stats.seemsCanned) {
    const parts = []
    parts.push(emoji.canned)
    parts.push(`0${emoji.gold}`)

    text += '\n' + parts.join(' ')
  }

  return text
}

function createArmyStatsPart(armyAmount: number, includeBarracksLevel: boolean): string {
  if (!Number.isFinite(armyAmount)) {
    return '?????' + emoji.army
  }

  let text = ''
  text += `${formatNumberShort(armyAmount, true)}${emoji.army}`
  if (includeBarracksLevel) {
    text += ` (${calcBarracksNeeded(armyAmount)}${emoji.barracks})`
  }

  return text
}

export function createPlayerStatsSingleLineString(stats: PlayerStats, telegramId: number | undefined, armyOverride: number | undefined): string {
  const immune = isImmune(stats.player)
  const infos: string[] = []

  if (armyOverride) {
    infos.push(formatNumberShort(armyOverride) + emoji.army)
  } else if (immune) {
    infos.push(emoji.immunity)
  } else if (Number.isFinite(stats.army)) {
    infos.push(formatNumberShort(stats.army) + emoji.army)
  } else {
    infos.push('?????' + emoji.army)
  }

  if (immune) {
    infos.push(emoji.poweruser)
  }

  infos.push(
    telegramId ?
      createPlayerMarkdownLink(telegramId, stats) :
      createPlayerNameString(stats, true)
  )

  return infos.join(' ')
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

export function createTwoSidesStatsString(side1stats: readonly PlayerStats[], side2stats: readonly PlayerStats[], playerArmyOverride: Record<string, number>, playerTelegramIds: Record<string, number>): string {
  let text = ''
  text += createTwoSidesArmyStrengthString(side1stats, side2stats, playerArmyOverride)

  text += '\n\n'
  text += createMultipleStatsPlayerList(side1stats, playerArmyOverride, playerTelegramIds)

  text += '\n\n'
  text += createMultipleStatsPlayerList(side2stats, playerArmyOverride, playerTelegramIds)

  return text
}

function createMultipleStatsPlayerList(statsArray: readonly PlayerStats[], playerArmyOverride: Record<string, number>, playerTelegramIds: Record<string, number>): string {
  return statsArray
    .map(o => createPlayerStatsSingleLineString(o, playerTelegramIds[o.player], playerArmyOverride[o.player]))
    .join('\n')
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
        return Number.NaN
      }

      return o.army
    })
  const armyRaw = getSumAverageAmount(armyArr)
  const army = {
    ...armyRaw,
    amount: armyArr.length,
    sum: armyArr.length * armyRaw.avg
  }

  const statsString = createSimpleDataString(army, emoji.army, ['avg', 'sum'], true)
  const armyString = `${alliance} ${army.amount}x ${statsString}`

  return {
    alliance,
    army,
    armyString
  }
}
