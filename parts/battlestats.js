const Telegraf = require('telegraf')
const stringify = require('json-stable-stringify')
const debounce = require('debounce-promise')

const battlereports = require('../lib/battlereports')

const {getMidnightXDaysEarlier} = require('../lib/number-functions')
const {createBattleStatsString} = require('../lib/create-stats-strings')

const DEBOUNCE_TIME = 100 // Milliseconds

const bot = new Telegraf.Composer()

function isBattleReport(ctx) {
  return ctx.state.screen &&
         ctx.state.screen.information &&
         ctx.state.screen.information.battlereport
}

// Save battlereport
bot.on('text', Telegraf.optional(isBattleReport, async (ctx, next) => {
  const newInformation = ctx.state.screen.information
  const {timestamp} = ctx.state.screen

  const currentlyExisting = await battlereports.get(ctx.from.id, timestamp)
  if (stringify(currentlyExisting) === stringify(newInformation.battlereport)) {
    return ctx.reply('Thats not new to me. I will just ignore it.')
  }
  await battlereports.add(ctx.from.id, timestamp, newInformation.battlereport)
  await ctx.replyWithMarkdown('battlereport added:\n```\n' + stringify(newInformation.battlereport, {space: 2}) + '\n```')

  return next()
}))

// Send battle stats
const debouncedBattleStats = {}
bot.on('text', Telegraf.optional(isBattleReport, ctx => {
  const {id} = ctx.from
  if (!debouncedBattleStats[id]) {
    debouncedBattleStats[id] = debounce(sendBattleReport, DEBOUNCE_TIME)
  }
  debouncedBattleStats[id](ctx)
}))

async function sendBattleReport(ctx) {
  const allReportsOfMyself = await battlereports.getAllFrom(ctx.from.id)
  const firstTimeRelevant = getMidnightXDaysEarlier(Date.now() / 1000, 7)
  const reportsFiltered = Object.keys(allReportsOfMyself)
    .filter(key => Number(key) > firstTimeRelevant)
    .map(key => allReportsOfMyself[key])
    .filter(() => true)

  return ctx.replyWithMarkdown(
    createBattleStatsString(reportsFiltered)
  )
}

module.exports = {
  bot
}
