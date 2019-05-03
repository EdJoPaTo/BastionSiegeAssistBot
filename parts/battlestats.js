const arrayFilterUnique = require('array-filter-unique')
const Telegraf = require('telegraf')
const TelegrafInlineMenu = require('telegraf-inline-menu')
const {
  sameBattleResourceAssumption,
  uniqueBattlereportIdentifier
} = require('bastion-siege-logic')

const regexHelper = require('../lib/javascript-abstraction/regex-helper')

const battlereports = require('../lib/data/battlereports')
const poweruser = require('../lib/data/poweruser')

const {getMidnightXDaysEarlier, getHoursEarlier} = require('../lib/math/unix-timestamp')
const {getSumAverageAmount} = require('../lib/math/number-array')
const battleStats = require('../lib/math/battle-stats')

const {createAverageMaxString} = require('../lib/user-interface/number-array-strings')
const {createBattleStatsString, createRanking} = require('../lib/user-interface/battle-stats')
const {createPlayerNameString} = require('../lib/user-interface/player-stats')
const {emoji} = require('../lib/user-interface/output-text')

const BATTLESTATS_DEFAULTS = {
  timeframe: '24h',
  type: 'gold',
  view: 'solo'
}

const menu = new TelegrafInlineMenu(getBattlestatsText)
menu.setCommand('battlestats')

function viewOptions(ctx) {
  const options = ['solo']

  const isPoweruser = poweruser.isPoweruser(ctx.from.id)
  const {alliance} = ctx.session.gameInformation.player || {}
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
  isSetFunc: (ctx, key) => getCurrentView(ctx) === key,
  setFunc: (ctx, key) => {
    if (!ctx.session.battlestats) {
      ctx.session.battlestats = {...BATTLESTATS_DEFAULTS}
    }

    ctx.session.battlestats.view = key
  },
  textFunc: (ctx, key) => {
    switch (key) {
      case 'allianceAttacks': return emoji.alliance + ctx.i18n.t('battle.alliance')
      case 'allianceMates': return emoji.alliance + ctx.i18n.t('bs.allianceMembers')
      case 'allianceSolo': return emoji.alliance + ctx.i18n.t('battle.solo')
      case 'solo': return emoji.solo + ctx.i18n.t('battle.solo')
      default: return key
    }
  }
})

function getCurrentView(ctx) {
  const {view} = ctx.session.battlestats || BATTLESTATS_DEFAULTS
  if (!viewOptions(ctx).includes(view)) {
    return BATTLESTATS_DEFAULTS.view
  }

  return view
}

menu.select('rewardType', {gold: emoji.gold, terra: emoji.terra, karma: emoji.karma, gems: emoji.gem}, {
  isSetFunc: (ctx, key) => (ctx.session.battlestats || BATTLESTATS_DEFAULTS).type === key,
  setFunc: (ctx, key) => {
    if (!ctx.session.battlestats) {
      ctx.session.battlestats = {...BATTLESTATS_DEFAULTS}
    }

    ctx.session.battlestats.type = key
  }
})

menu.select('hours', ['6h', '12h', '24h', '48h'], {
  setFunc: setCurrentTimeframe,
  isSetFunc: isCurrentTimeframe
})

menu.select('days', ['7d', '30d'], {
  hide: ctx => getCurrentView(ctx) !== 'solo',
  setFunc: setCurrentTimeframe,
  isSetFunc: isCurrentTimeframe
})

menu.select('specific', ['all'], {
  hide: ctx => getCurrentView(ctx) !== 'solo',
  textFunc: ctx => ctx.i18n.t('battlestats.alltime'),
  setFunc: ctx => setCurrentTimeframe(ctx, 'all'),
  isSetFunc: ctx => isCurrentTimeframe(ctx, 'all')
})

function isCurrentTimeframe(ctx, selected) {
  return getCurrentTimeframe(ctx) === selected
}

function getCurrentTimeframe(ctx) {
  const view = getCurrentView(ctx)
  const {timeframe} = ctx.session.battlestats || BATTLESTATS_DEFAULTS
  if (timeframe.endsWith('h') || view === 'solo') {
    return timeframe
  }

  return '24h'
}

function setCurrentTimeframe(ctx, newValue) {
  if (!ctx.session.battlestats) {
    ctx.session.battlestats = {...BATTLESTATS_DEFAULTS}
  }

  ctx.session.battlestats.timeframe = newValue
}

function getFirstTimeRelevantForTimeframe(timeframe, now = Date.now() / 1000) {
  if (timeframe === 'all') {
    return 0
  }

  const scale = regexHelper.get(timeframe, /(d|h)/)
  const amount = regexHelper.getNumber(timeframe, /(\d+)/)
  if (scale === 'd') {
    return getMidnightXDaysEarlier(now, amount)
  }

  return getHoursEarlier(now, amount)
}

function getBattlestatsText(ctx) {
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

function createHeader(ctx, timeframe, isAllianceRelated) {
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

function createSolo(ctx) {
  const timeframe = getCurrentTimeframe(ctx)
  const firstTimeRelevant = getFirstTimeRelevantForTimeframe(timeframe)
  const reports = battlereports.getAll()
    .filter(o => o.providingTgUser === ctx.from.id)
    .filter(report => report.time > firstTimeRelevant)

  let text = createHeader(ctx, timeframe, false)
  text += '\n\n'

  const {type} = ctx.session.battlestats || BATTLESTATS_DEFAULTS
  const stats = battleStats.generate(reports, o => o[type])
  text += createBattleStatsString(stats, type, ctx.i18n.locale())

  return text
}

function getAllianceRelevantData(ctx) {
  const timeframe = getCurrentTimeframe(ctx)
  const firstTimeRelevant = getFirstTimeRelevantForTimeframe(timeframe)

  let text = createHeader(ctx, timeframe, true)
  text += '\n'

  if (!poweruser.isPoweruser(ctx.from.id)) {
    text += emoji.poweruser + ' ' + ctx.i18n.t('poweruser.usefulWhen')
    return {header: text}
  }

  const {alliance} = ctx.session.gameInformation.player
  if (!alliance) {
    text += ctx.i18n.t('name.noAlliance')
    return {header: text}
  }

  const allianceMates = poweruser.getPoweruserSessions()
    .filter(o => o.data.gameInformation.player.alliance === alliance)

  text += ctx.i18n.t('bs.allianceMembers')
  text += `: ${allianceMates.length}${emoji.poweruser}\n`

  return {
    allianceMates,
    firstTimeRelevant,
    header: text
  }
}

function createAllianceSolo(ctx) {
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

  const {type} = ctx.session.battlestats || BATTLESTATS_DEFAULTS
  const stats = battleStats.generate(reports, o => o[type])
  text += createBattleStatsString(stats, type, ctx.i18n.locale())

  return text
}

function createAllianceAttacks(ctx) {
  const {firstTimeRelevant, allianceMates, header} = getAllianceRelevantData(ctx)

  let text = ''
  text += header

  if (!allianceMates) {
    return ctx.replyWithMarkdown(text)
  }

  const allianceMateNames = allianceMates
    .map(o => o.data.gameInformation.player.name)

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
    }, {})

  const battleParticipants = getSumAverageAmount(uniqueBattles.map(o => o.friends.length))
  text += createAverageMaxString(battleParticipants, ctx.i18n.t('battlestats.attendance'), '', true)
  text += '\n\n'

  const {type} = ctx.session.battlestats || BATTLESTATS_DEFAULTS
  const stats = battleStats.generate(uniqueBattles, o => sameBattleResourceAssumption(
    reportsGroupedByBattle[uniqueBattlereportIdentifier(o)],
    type
  ))
  text += createBattleStatsString(stats, type, ctx.i18n.locale())

  return text
}

function createAllianceMates(ctx) {
  const {firstTimeRelevant, allianceMates, header} = getAllianceRelevantData(ctx)

  let text = ''
  text += header

  if (!allianceMates) {
    return ctx.replyWithMarkdown(text)
  }

  const relevantReports = battlereports.getAll()
    .filter(o => o.time > firstTimeRelevant)

  const mateInfo = allianceMates
    .map(o => ({user: o.user, playername: o.data.gameInformation.player.name}))
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

  const {name} = ctx.session.gameInformation.player
  text += '\n'
  text += createRanking(mateInfo, 'battlereport', ctx.i18n.t('battlereports'), name)
  const {type} = (ctx.session.battlestats || BATTLESTATS_DEFAULTS)
  text += createRanking(mateInfo, type, ctx.i18n.t('bs.resources.resources'), name)

  return text
}

const bot = new Telegraf.Composer()
bot.use(menu.init({
  actionCode: 'battlestats'
}))

module.exports = {
  bot
}
