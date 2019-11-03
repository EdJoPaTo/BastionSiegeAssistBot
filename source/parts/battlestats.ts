import {Composer} from 'telegraf'
import arrayFilterUnique from 'array-filter-unique'
import TelegrafInlineMenu from 'telegraf-inline-menu'
import {
  sameBattleResourceAssumption,
  uniqueBattlereportIdentifier,
  BattlereportResource
} from 'bastion-siege-logic'

import {Session, BattlereportInMemory, BattlestatsView} from '../lib/types'

import * as regexHelper from '../lib/javascript-abstraction/regex-helper'

import {SessionRaw} from '../lib/data/user-sessions'
import * as battlereports from '../lib/data/battlereports'
import * as poweruser from '../lib/data/poweruser'

import {getMidnightXDaysEarlier, getHoursEarlier} from '../lib/math/unix-timestamp'
import {getSumAverageAmount} from '../lib/math/number-array'
import * as battleStats from '../lib/math/battle-stats'

import {createAverageMaxString} from '../lib/user-interface/number-array-strings'
import {createBattleStatsString, createRanking} from '../lib/user-interface/battle-stats'
import {createPlayerNameString} from '../lib/user-interface/player-stats'
import {emoji} from '../lib/user-interface/output-text'

type Dictionary<T> = {[key: string]: T}

const DEFAULT_TIMEFRAME = '24h'
const DEFAULT_TYPE = 'gold'
const DEFAULT_VIEW = 'solo'

const menu = new TelegrafInlineMenu(getBattlestatsText)
menu.setCommand('battlestats')

function viewOptions(ctx: any): BattlestatsView[] {
  const session = ctx.session as Session
  const options: BattlestatsView[] = ['solo']

  const isPoweruser = poweruser.isPoweruser(ctx.from.id)
  const {player} = session.gameInformation
  const alliance = player && player.alliance
  if (isPoweruser && alliance) {
    options.push('allianceMates')
    options.push('allianceSolo')
    options.push('allianceAttacks')
  }

  return options
}

menu.select('view', viewOptions, {
  columns: 2,
  hide: (ctx: any) => viewOptions(ctx).length === 1,
  isSetFunc: (ctx, key) => getCurrentView(ctx) === key,
  setFunc: (ctx: any, key) => {
    const session = ctx.session as Session
    if (!session.battlestats) {
      session.battlestats = {}
    }

    session.battlestats.view = key as BattlestatsView
  },
  textFunc: (ctx: any, key) => {
    switch (key) {
      case 'allianceAttacks': return `${emoji.alliance}${ctx.i18n.t('battle.alliance')}`
      case 'allianceMates': return `${emoji.alliance}${ctx.i18n.t('bs.allianceMembers')}`
      case 'allianceSolo': return `${emoji.alliance}${ctx.i18n.t('battle.solo')}`
      case 'solo': return `${emoji.solo}${ctx.i18n.t('battle.solo')}`
      default: return key
    }
  }
})

function getCurrentView(ctx: any): BattlestatsView {
  const {battlestats} = ctx.session as Session
  const view = (battlestats && battlestats.view) || DEFAULT_VIEW
  if (!viewOptions(ctx).includes(view)) {
    return DEFAULT_VIEW
  }

  return view
}

function getCurrentType(ctx: any): BattlereportResource {
  const {battlestats} = ctx.session as Session
  const type = battlestats && battlestats.type
  return type || DEFAULT_TYPE
}

menu.select('rewardType', {gold: emoji.gold, terra: emoji.terra, karma: emoji.karma, gems: emoji.gem}, {
  isSetFunc: (ctx: any, key) => getCurrentType(ctx) === key,
  setFunc: (ctx: any, key) => {
    const session = ctx.session as Session
    if (!session.battlestats) {
      session.battlestats = {}
    }

    session.battlestats.type = key as BattlereportResource
  }
})

menu.select('hours', ['6h', '12h', '24h', '48h'], {
  setFunc: setCurrentTimeframe,
  isSetFunc: isCurrentTimeframe
})

menu.select('days', ['7d', '30d'], {
  hide: (ctx: any) => getCurrentView(ctx) !== 'solo',
  setFunc: setCurrentTimeframe,
  isSetFunc: isCurrentTimeframe
})

menu.select('specific', ['all'], {
  hide: (ctx: any) => getCurrentView(ctx) !== 'solo',
  textFunc: (ctx: any) => ctx.i18n.t('battlestats.alltime'),
  setFunc: ctx => setCurrentTimeframe(ctx, 'all'),
  isSetFunc: ctx => isCurrentTimeframe(ctx, 'all')
})

function isCurrentTimeframe(ctx: any, selected: string): boolean {
  return getCurrentTimeframe(ctx) === selected
}

function getCurrentTimeframe(ctx: any): string {
  const {battlestats} = ctx.session as Session
  const timeframe = (battlestats && battlestats.timeframe) || DEFAULT_TIMEFRAME
  const view = getCurrentView(ctx)
  if (timeframe.endsWith('h') || view === 'solo') {
    return timeframe
  }

  return '24h'
}

function setCurrentTimeframe(ctx: any, newValue: string): void {
  const session = ctx.session as Session
  if (!session.battlestats) {
    session.battlestats = {}
  }

  session.battlestats.timeframe = newValue
}

function getFirstTimeRelevantForTimeframe(timeframe: string, now = Date.now() / 1000): number {
  if (timeframe === 'all') {
    return 0
  }

  const scale = regexHelper.get(timeframe, /(d|h)/)
  const amount = regexHelper.getNumber(timeframe, /(\d+)/)!
  if (scale === 'd') {
    return getMidnightXDaysEarlier(now, amount)
  }

  return getHoursEarlier(now, amount)
}

function getBattlestatsText(ctx: any): string {
  const view = getCurrentView(ctx)
  switch (view) {
    case 'allianceAttacks':
      return createAllianceAttacks(ctx)
    case 'allianceMates':
      return createAllianceMates(ctx)
    case 'allianceSolo':
      return createAllianceSolo(ctx)
    default:
      return createSolo(ctx)
  }
}

function createHeader(ctx: any, timeframe: string, isAllianceRelated: boolean): string {
  let text = ''
  text += '*'
  if (isAllianceRelated) {
    text += ctx.i18n.t('bs.alliance')
    text += ' '
  }

  text += ctx.i18n.t('battlestats.title')
  text += '*'
  text += ' '

  text += '('
  if (timeframe === 'all') {
    text += ctx.i18n.t('battlestats.alltime')
  } else {
    text += timeframe
  }

  text += ')'

  return text
}

function createSolo(ctx: any): string {
  const timeframe = getCurrentTimeframe(ctx)
  const firstTimeRelevant = getFirstTimeRelevantForTimeframe(timeframe)
  const reports = battlereports.getAll()
    .filter(o => o.providingTgUser === ctx.from.id)
    .filter(report => report.time > firstTimeRelevant)

  let text = createHeader(ctx, timeframe, false)
  text += '\n\n'

  if (!poweruser.isPoweruser(ctx.from.id)) {
    text += emoji.poweruser
    text += ' '
    text += ctx.i18n.t('poweruser.usefulWhen')
    text += '\n\n'
  }

  const type = getCurrentType(ctx)
  const stats = battleStats.generate(reports, o => o[type])
  text += createBattleStatsString(stats, type, ctx.i18n.locale())

  return text
}

function getAllianceRelevantData(ctx: any): {allianceMates: SessionRaw[]; header: string; firstTimeRelevant: number} {
  const session = ctx.session as Session
  const timeframe = getCurrentTimeframe(ctx)
  const firstTimeRelevant = getFirstTimeRelevantForTimeframe(timeframe)

  let text = createHeader(ctx, timeframe, true)
  text += '\n'

  if (!poweruser.isPoweruser(ctx.from.id)) {
    text += emoji.poweruser
    text += ' '
    text += ctx.i18n.t('poweruser.usefulWhen')
    return {header: text, firstTimeRelevant, allianceMates: []}
  }

  const {player} = session.gameInformation
  const alliance = player && player.alliance
  if (!alliance) {
    text += ctx.i18n.t('name.noAlliance')
    return {header: text, firstTimeRelevant, allianceMates: []}
  }

  const allianceMates = poweruser.getPoweruserSessions()
    .filter(o => o.data.gameInformation.player!.alliance === alliance)

  text += ctx.i18n.t('bs.allianceMembers')
  text += `: ${allianceMates.length}${emoji.poweruser}\n`

  return {
    allianceMates,
    firstTimeRelevant,
    header: text
  }
}

function createAllianceSolo(ctx: any): string {
  const {firstTimeRelevant, allianceMates, header} = getAllianceRelevantData(ctx)

  let text = ''
  text += header
  text += '\n'

  if (!allianceMates) {
    return ctx.replyWithMarkdown(text)
  }

  const allianceMateUserIds = allianceMates
    .map(o => o.user)

  const reports = battlereports.getAll()
    .filter(o => allianceMateUserIds.includes(o.providingTgUser))
    .filter(report => report.time > firstTimeRelevant)

  const type = getCurrentType(ctx)
  const stats = battleStats.generate(reports, o => o[type])
  text += createBattleStatsString(stats, type, ctx.i18n.locale())

  return text
}

function createAllianceAttacks(ctx: any): string {
  const {firstTimeRelevant, allianceMates, header} = getAllianceRelevantData(ctx)

  let text = ''
  text += header

  if (!allianceMates) {
    return ctx.replyWithMarkdown(text)
  }

  const allianceMateNames = allianceMates
    .map(o => o.data.gameInformation.player!.name)

  const allReports = battlereports.getAll()
    .filter(o => o.friends.length > 1 || o.enemies.length > 1)
    .filter(o => o.time > firstTimeRelevant)
    .filter(o => o.friends.some(friend => allianceMateNames.includes(friend)))

  const uniqueBattles = allReports
    .filter(arrayFilterUnique(uniqueBattlereportIdentifier))

  const reportsGroupedByBattle = allReports
    .reduce((coll, cur) => {
      const key = uniqueBattlereportIdentifier(cur)
      if (!coll[key]) {
        coll[key] = []
      }

      coll[key].push(cur)
      return coll
    }, {} as Dictionary<BattlereportInMemory[]>)

  const battleParticipants = getSumAverageAmount(uniqueBattles.map(o => o.friends.length))
  text += createAverageMaxString(battleParticipants, ctx.i18n.t('battlestats.attendance'), '', true)
  text += '\n\n'

  const type = getCurrentType(ctx)
  const stats = battleStats.generate(uniqueBattles, o => sameBattleResourceAssumption(
    reportsGroupedByBattle[uniqueBattlereportIdentifier(o)],
    type
  ))
  text += createBattleStatsString(stats, type, ctx.i18n.locale())

  return text
}

function createAllianceMates(ctx: any): string {
  const {gameInformation} = ctx.session as Session
  const {firstTimeRelevant, allianceMates, header} = getAllianceRelevantData(ctx)

  let text = ''
  text += header

  if (!allianceMates) {
    return ctx.replyWithMarkdown(text)
  }

  const relevantReports = battlereports.getAll()
    .filter(o => o.time > firstTimeRelevant)

  const mateInfo = allianceMates
    .map(o => ({user: o.user, playername: o.data.gameInformation.player!.name}))
    .map(({user, playername}) => {
      const reports = relevantReports
        .filter(o => o.providingTgUser === user)

      const solo = reports
        .filter(o => o.won)
        .filter(o => o.friends.length === 1)
        .filter(o => !o.enemyMystic)

      const mystics = reports
        .filter(o => o.enemyMystic)

      return {
        playername,
        nameMarkdown: createPlayerNameString({player: playername}, true),
        battlereport: reports.length,
        gems: getSumAverageAmount(mystics.map(o => o.gems)),
        gold: getSumAverageAmount(solo.map(o => o.gold)),
        karma: getSumAverageAmount(solo.map(o => o.karma)),
        terra: getSumAverageAmount(solo.map(o => o.terra))
      }
    })

  const {name} = gameInformation.player!
  text += '\n'
  text += createRanking(mateInfo, 'battlereport', ctx.i18n.t('battlereports'), name)
  const type = getCurrentType(ctx)
  text += createRanking(mateInfo, type, ctx.i18n.t('bs.resources.resources'), name)

  return text
}

export const bot = new Composer()
bot.use(menu.init({
  actionCode: 'battlestats'
}))
