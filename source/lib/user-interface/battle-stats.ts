import {BattlereportRaw} from 'bastion-siege-logic'
import I18n from 'telegraf-i18n'

import {BattleStats} from '../types'

import {sortBy} from '../javascript-abstraction/array'

import {GroupedSumAverageAmount, SumAverageAmount} from '../math/number-array'

import {emoji} from './output-text'
import {formatNumberShort} from './format-number'
import {createAverageSumString} from './number-array-strings'

const i18n = new I18n({
  directory: 'locales',
  defaultLanguageOnMissing: true,
  defaultLanguage: 'en'
})

export function createBattleStatsString(stats: BattleStats, selector: string, language: string): string {
  let text = ''
  if (stats.reward.sum) {
    text += '\n' + createAverageSumString(stats.reward, `*${i18n.t(language, 'battlestats.total')}*`, emoji[selector], true)
  }

  text += createBattleStatsStringPerAlliance(stats.mystics, i18n.t(language, 'mystics'), emoji[selector], true)

  text += createBattleStatsStringPerAlliance(stats.rewardAttackWon, i18n.t(language, 'battlestats.wonAttacks'), emoji[selector], true)
  text += createBattleStatsStringPerAlliance(stats.rewardDefenseWon, i18n.t(language, 'battlestats.wonDefences'), emoji[selector], true)
  text += createBattleStatsStringPerAlliance(stats.rewardAttackLost, i18n.t(language, 'battlestats.lostAttacks'), emoji[selector], true)
  text += createBattleStatsStringPerAlliance(stats.rewardDefenseLost, i18n.t(language, 'battlestats.lostDefences'), emoji[selector], true)

  return text.trim()
}

function createBattleStatsStringPerAlliance(rewards: GroupedSumAverageAmount, title: string, unit: string, isInteger: boolean): string {
  if (rewards.all.amount === 0) {
    return ''
  }

  let text = ''
  text += '\n\n'
  text += createAverageSumString(rewards.all, `*${title}*`, unit, isInteger)
  text += '\n'

  const entries = Object.keys(rewards.grouped)
    .map(key => ({alliance: key, stats: rewards.grouped[key]}))
    .filter(o => o.stats.amount > 0)
    .sort(sortBy(o => Math.abs(o.stats.sum), true))
    .slice(0, 20) // Top 20
    .map(({alliance, stats}) => createAverageSumString(
      stats,
      String(alliance).replace('undefined', '     '),
      unit, isInteger
    ))

  text += entries.join('\n')
  return text
}

export function createSingleBattleShortStatsLine(report: BattlereportRaw): string {
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

export function createSingleAllianceBattleShortStatsLine(report: BattlereportRaw): string {
  const {won, friends, gold} = report
  let text = ''

  text += emoji.alliance
  text += won ? emoji.win : emoji.lose
  text += ' '
  const additionalStats = []
  additionalStats.push(formatNumberShort(gold * friends.length, true) + emoji.gold)

  text += additionalStats.join(' ')
  return text
}

function numberOfSAAOrNumber(saaOrNumber: number | SumAverageAmount, saaKey: keyof SumAverageAmount): number {
  return typeof saaOrNumber === 'number' ? saaOrNumber : saaOrNumber[saaKey]
}

export function createRanking(data: any[], key: string, title: string): string {
  const entries = data
    .filter(o => numberOfSAAOrNumber(o[key], 'amount') > 0)
    .sort(sortBy(o => numberOfSAAOrNumber(o[key], 'sum'), true))
    .map((o, i) => {
      o.rank = i + 1
      return o
    })
    .map(o => {
      const prefix = `${o.rank}. ${o.nameMarkdown}`

      if (Number.isFinite(o[key])) {
        return `${prefix} ${formatNumberShort(o[key], true)}${emoji[key]}`
      }

      return createAverageSumString(o[key], prefix, emoji[key], true)
    })
    .filter(o => o)

  if (entries.length === 0) {
    return ''
  }

  let text = ''
  text += `*${title}*\n`
  text += entries
    .join('\n')
  text += '\n\n'

  return text
}
