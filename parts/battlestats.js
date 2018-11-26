const Telegraf = require('telegraf')
const stringify = require('json-stable-stringify')

const battlereports = require('../lib/battlereports')

const {getMidnightXDaysEarlier} = require('../lib/number-functions')
const {createBattleStatsString} = require('../lib/create-stats-strings')

const {Extra, Markup} = Telegraf

const bot = new Telegraf.Composer()

function isBattleReport(ctx) {
  return ctx.state.screen &&
         ctx.state.screen.information &&
         ctx.state.screen.information.battlereport
}

// Save battlereport
bot.on('text', Telegraf.optional(isBattleReport, async ctx => {
  const newInformation = ctx.state.screen.information
  const {timestamp} = ctx.state.screen

  const buttons = [
    [
      Markup.callbackButton('Your Battle Stats', 'battlestats')
    ]
  ]
  if (newInformation.battlereport.enemies.length === 1) {
    buttons.push([
      Markup.switchToCurrentChatButton('Enemy Player Stats', newInformation.battlereport.enemies[0]),
      Markup.switchToChatButton('Share Player Stats…', newInformation.battlereport.enemies[0])
    ])
  }
  const extra = Extra.markdown().markup(
    Markup.inlineKeyboard(buttons)
  )

  const currentlyExisting = await battlereports.get(ctx.from.id, timestamp)
  if (stringify(currentlyExisting) === stringify(newInformation.battlereport)) {
    return ctx.reply('Thats not new to me. I will just ignore it.', extra)
  }
  await battlereports.add(ctx.from.id, timestamp, newInformation.battlereport)
  await ctx.reply('battlereport added:\n```\n' + stringify(newInformation.battlereport, {space: 2}) + '\n```', extra)
}))

bot.command('battlestats', sendBattleStats)
bot.action('battlestats', sendBattleStats)

async function sendBattleStats(ctx) {
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
