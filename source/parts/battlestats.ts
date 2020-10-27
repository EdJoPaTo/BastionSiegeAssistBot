import {Composer} from 'telegraf'
import arrayFilterUnique from 'array-filter-unique'
import arrayReduceGroupBy from 'array-reduce-group-by'
import {MenuTemplate, MenuMiddleware, Body} from 'telegraf-inline-menu'
import {
  sameBattleResourceAssumption,
  uniqueBattlereportIdentifier,
  BattlereportResource
} from 'bastion-siege-logic'

import {Context, BattlestatsView} from '../lib/types'

import * as regexHelper from '../lib/javascript-abstraction/regex-helper'

import {SessionRaw} from '../lib/data/user-sessions'
import * as battlereports from '../lib/data/ingame/battlereports'
import * as poweruser from '../lib/data/poweruser'

import {getMidnightXDaysEarlier, getHoursEarlier} from '../lib/math/unix-timestamp'
import {getSumAverageAmount} from '../lib/math/number-array'
import * as battleStats from '../lib/math/battle-stats'

import {createAverageMaxString} from '../lib/user-interface/number-array-strings'
import {createBattleStatsString, createRanking} from '../lib/user-interface/battle-stats'
import {createPlayerMarkdownLink} from '../lib/user-interface/player-stats'
import {emoji} from '../lib/user-interface/output-text'

const DEFAULT_TIMEFRAME = '24h'
const DEFAULT_TYPE = 'gold'
const DEFAULT_VIEW = 'solo'

const menu = new MenuTemplate<Context>(getBattlestatsBody)

function viewOptions(ctx: Context): BattlestatsView[] {
  const options: BattlestatsView[] = ['solo']

  const isPoweruser = poweruser.isPoweruser(ctx.from!.id)
  const {player} = ctx.session.gameInformation
  const alliance = player?.alliance
  if (isPoweruser && alliance) {
    options.push('allianceMates')
    options.push('allianceSolo')
    options.push('allianceAttacks')
  }

  return options
}

menu.select('view', viewOptions, {
  columns: 2,
  hide: ctx => viewOptions(ctx).length === 1,
  isSet: (ctx, key) => getCurrentView(ctx) === key,
  set: (ctx, key) => {
    if (!ctx.session.battlestats) {
      ctx.session.battlestats = {}
    }

    ctx.session.battlestats.view = key as BattlestatsView
    return true
  },
  buttonText: (ctx, key) => {
    switch (key) {
      case 'allianceAttacks': return `${emoji.alliance}${ctx.i18n.t('battle.alliance')}`
      case 'allianceMates': return `${emoji.alliance}${ctx.i18n.t('bs.allianceMembers')}`
      case 'allianceSolo': return `${emoji.alliance}${ctx.i18n.t('battle.solo')}`
      case 'solo': return `${emoji.solo}${ctx.i18n.t('battle.solo')}`
      default: return key
    }
  }
})

function getCurrentView(ctx: Context): BattlestatsView {
  const {battlestats} = ctx.session
  const view = (battlestats?.view) || DEFAULT_VIEW
  if (!viewOptions(ctx).includes(view)) {
    return DEFAULT_VIEW
  }

  return view
}

function getCurrentType(ctx: Context): BattlereportResource {
  const {battlestats} = ctx.session
  const type = battlestats?.type
  return type || DEFAULT_TYPE
}

menu.select('rewardType', {gold: emoji.gold, terra: emoji.terra, karma: emoji.karma, gems: emoji.gem}, {
  isSet: (ctx, key) => getCurrentType(ctx) === key,
  set: (ctx, key) => {
    if (!ctx.session.battlestats) {
      ctx.session.battlestats = {}
    }

    ctx.session.battlestats.type = key as BattlereportResource
    return true
  }
})

menu.select('hours', ['6h', '12h', '24h', '48h'], {
  set: setCurrentTimeframe,
  isSet: (ctx, key) => getCurrentTimeframe(ctx) === key
})

menu.select('days', ['7d', '30d'], {
  hide: ctx => getCurrentView(ctx) !== 'solo',
  set: setCurrentTimeframe,
  isSet: (ctx, key) => getCurrentTimeframe(ctx) === key
})

menu.select('specific', ['all'], {
  hide: ctx => getCurrentView(ctx) !== 'solo',
  buttonText: ctx => ctx.i18n.t('battlestats.alltime'),
  set: ctx => setCurrentTimeframe(ctx, 'all'),
  isSet: ctx => getCurrentTimeframe(ctx) === 'all'
})

function getCurrentTimeframe(ctx: Context): string {
  const {battlestats} = ctx.session
  const timeframe = (battlestats?.timeframe) || DEFAULT_TIMEFRAME
  const view = getCurrentView(ctx)
  if (timeframe.endsWith('h') || view === 'solo') {
    return timeframe
  }

  return '24h'
}

function setCurrentTimeframe(ctx: Context, newValue: string): true {
  if (!ctx.session.battlestats) {
    ctx.session.battlestats = {}
  }

  ctx.session.battlestats.timeframe = newValue
  return true
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

function getBattlestatsBody(ctx: Context): Body {
  const view = getCurrentView(ctx)
  switch (view) {
    case 'allianceAttacks':
      return createAllianceAttacksBody(ctx)
    case 'allianceMates':
      return createAllianceMatesBody(ctx)
    case 'allianceSolo':
      return createAllianceSoloBody(ctx)
    default:
      return createSoloBody(ctx)
  }
}

function createHeader(ctx: Context, timeframe: string, isAllianceRelated: boolean): string {
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
  text += timeframe === 'all' ? ctx.i18n.t('battlestats.alltime') : timeframe

  text += ')'

  return text
}

function createSoloBody(ctx: Context): Body {
  const timeframe = getCurrentTimeframe(ctx)
  const firstTimeRelevant = getFirstTimeRelevantForTimeframe(timeframe)
  const reports = battlereports.getByProvidingUser(ctx.from!.id)
    .filter(report => report.time > firstTimeRelevant)

  let text = createHeader(ctx, timeframe, false)
  text += '\n\n'

  if (!poweruser.isPoweruser(ctx.from!.id)) {
    text += emoji.poweruser
    text += ' '
    text += ctx.i18n.t('poweruser.usefulWhen')
    text += '\n\n'
  }

  const type = getCurrentType(ctx)
  const stats = battleStats.generate(reports, o => o[type])
  text += createBattleStatsString(stats, type, ctx.i18n.locale())

  return {text, parse_mode: 'Markdown'}
}

function getAllianceRelevantData(ctx: Context): {allianceMates: readonly SessionRaw[]; header: string; firstTimeRelevant: number} {
  const timeframe = getCurrentTimeframe(ctx)
  const firstTimeRelevant = getFirstTimeRelevantForTimeframe(timeframe)

  let text = createHeader(ctx, timeframe, true)
  text += '\n'

  if (!poweruser.isPoweruser(ctx.from!.id)) {
    text += emoji.poweruser
    text += ' '
    text += ctx.i18n.t('poweruser.usefulWhen')
    return {header: text, firstTimeRelevant, allianceMates: []}
  }

  const {player} = ctx.session.gameInformation
  const alliance = player?.alliance
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

function createAllianceSoloBody(ctx: Context): Body {
  const {firstTimeRelevant, allianceMates, header} = getAllianceRelevantData(ctx)

  let text = ''
  text += header
  text += '\n'

  if (!allianceMates) {
    return text
  }

  const reports = allianceMates
    .flatMap(o => battlereports.getByProvidingUser(o.user))
    .filter(report => report.time > firstTimeRelevant)

  const type = getCurrentType(ctx)
  const stats = battleStats.generate(reports, o => o[type])
  text += createBattleStatsString(stats, type, ctx.i18n.locale())

  return {text, parse_mode: 'Markdown'}
}

function createAllianceAttacksBody(ctx: Context): Body {
  const {firstTimeRelevant, allianceMates, header} = getAllianceRelevantData(ctx)

  let text = ''
  text += header

  if (!allianceMates) {
    return text
  }

  const allReports = allianceMates
    .flatMap(o => battlereports.getByProvidingUser(o.user))
    .filter(o => o.friends.length > 1 || o.enemies.length > 1)
    .filter(report => report.time > firstTimeRelevant)

  const uniqueBattles = allReports
    .filter(arrayFilterUnique(uniqueBattlereportIdentifier))

  const reportsGroupedByBattle = allReports
    .reduce(arrayReduceGroupBy(uniqueBattlereportIdentifier), {})

  const battleParticipants = getSumAverageAmount(uniqueBattles.map(o => o.friends.length))
  text += createAverageMaxString(battleParticipants, ctx.i18n.t('battlestats.attendance'), '', true)
  text += '\n\n'

  const type = getCurrentType(ctx)
  const stats = battleStats.generate(uniqueBattles, o => sameBattleResourceAssumption(
    reportsGroupedByBattle[uniqueBattlereportIdentifier(o)],
    type
  ))
  text += createBattleStatsString(stats, type, ctx.i18n.locale())

  return {text, parse_mode: 'Markdown'}
}

function createAllianceMatesBody(ctx: Context): Body {
  const {firstTimeRelevant, allianceMates, header} = getAllianceRelevantData(ctx)

  let text = ''
  text += header

  if (!allianceMates) {
    return text
  }

  const mateInfo = allianceMates
    .map(o => ({user: o.user, playername: o.data.gameInformation.player!.name}))
    .map(({user, playername}) => {
      const reports = battlereports.getByProvidingUser(user)
        .filter(o => o.time > firstTimeRelevant)

      const solo = reports
        .filter(o => o.friends.length === 1)
        .filter(o => !o.enemyMystic)

      const mystics = reports
        .filter(o => o.enemyMystic)

      return {
        playername,
        nameMarkdown: createPlayerMarkdownLink(user, {player: playername}),
        battlereport: solo.length,
        gems: getSumAverageAmount(mystics.map(o => o.gems)),
        gold: getSumAverageAmount(solo.map(o => o.gold)),
        karma: getSumAverageAmount(solo.map(o => o.karma)),
        terra: getSumAverageAmount(solo.map(o => o.terra))
      }
    })

  text += '\n'
  text += createRanking(mateInfo, 'battlereport', ctx.i18n.t('battlereports'))
  const type = getCurrentType(ctx)
  text += createRanking(mateInfo, type, ctx.i18n.t('bs.resources.resources'))

  return {text, parse_mode: 'Markdown'}
}

export const bot = new Composer<Context>()
const menuMiddleware = new MenuMiddleware('battlestats/', menu)
bot.command('battlestats', async ctx => menuMiddleware.replyToContext(ctx))
bot.use(menuMiddleware)
