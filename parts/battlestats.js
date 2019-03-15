const Telegraf = require('telegraf')
const TelegrafInlineMenu = require('telegraf-inline-menu')

const regexHelper = require('../lib/javascript-abstraction/regex-helper')

const battlereports = require('../lib/data/battlereports')

const {getMidnightXDaysEarlier, getHoursEarlier} = require('../lib/math/unix-timestamp')
const battleStats = require('../lib/math/battle-stats')

const {createBattleStatsString} = require('../lib/user-interface/battle-stats')
const {emoji} = require('../lib/user-interface/output-text')

const BATTLESTATS_DEFAULTS = {
  timeframe: '24h',
  type: 'gold'
}

const menu = new TelegrafInlineMenu(getBattlestatsText)
menu.setCommand('battlestats')

menu.select('rewardType', {gold: emoji.gold, terra: emoji.terra, karma: emoji.karma, gems: emoji.gem}, {
  isSetFunc: (ctx, key) => (ctx.session.battlestats || BATTLESTATS_DEFAULTS).type === key,
  setFunc: (ctx, key) => {
    if (!ctx.session.battlestats) {
      ctx.session.battlestats = BATTLESTATS_DEFAULTS
    }

    ctx.session.battlestats.type = key
  }
})

menu.select('hours', ['6h', '12h', '24h', '48h'], {
  setFunc: setCurrentTimeframe,
  isSetFunc: isCurrentTimeframe
})

menu.select('days', ['7d', '30d'], {
  setFunc: setCurrentTimeframe,
  isSetFunc: isCurrentTimeframe
})

menu.select('specific', {all: 'All Time'}, {
  setFunc: ctx => setCurrentTimeframe(ctx, 'all'),
  isSetFunc: ctx => isCurrentTimeframe(ctx, 'all')
})

function isCurrentTimeframe(ctx, selected) {
  return getCurrentTimeframe(ctx) === selected
}

function getCurrentTimeframe(ctx) {
  return (ctx.session.battlestats || BATTLESTATS_DEFAULTS).timeframe
}

function setCurrentTimeframe(ctx, newValue) {
  if (!ctx.session.battlestats) {
    ctx.session.battlestats = BATTLESTATS_DEFAULTS
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
  const allReportsOfMyself = battlereports.getAll()
    .filter(o => o.providingTgUser === ctx.from.id)
  const timeframe = getCurrentTimeframe(ctx)
  const firstTimeRelevant = getFirstTimeRelevantForTimeframe(timeframe)
  const reportsFiltered = allReportsOfMyself
    .filter(report => report.time > firstTimeRelevant)

  const stats = battleStats.generate(reportsFiltered, (ctx.session.battlestats || BATTLESTATS_DEFAULTS).type)

  let text = '*Battle Stats* of '
  if (timeframe === 'all') {
    text += 'all time'
  } else {
    text += 'the last '
    text += timeframe
  }

  text += ` (${reportsFiltered.length})`
  text += '\n\n'
  text += createBattleStatsString(stats, (ctx.session.battlestats || BATTLESTATS_DEFAULTS).type)

  return text
}

const bot = new Telegraf.Composer()
bot.use(menu.init({
  actionCode: 'battlestats'
}))

module.exports = {
  bot
}
