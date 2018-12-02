const Telegraf = require('telegraf')
const stringify = require('json-stable-stringify')

const battlereports = require('../lib/battlereports')

const {emoji} = require('../lib/gamescreen.emoji')
const {formatNumberShort, getMidnightXDaysEarlier} = require('../lib/number-functions')
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
  const report = ctx.state.screen.information.battlereport
  const {timestamp} = ctx.state.screen

  const {attack, won, reward} = report

  const buttons = [
    [
      Markup.callbackButton('Your Battle Stats', 'battlestats')
    ],
    [
      Markup.callbackButton('Enemy Player Stats', `player-${report.enemies[0]}`, report.enemies.length > 1)
    ]
  ]
  const extra = Extra.markdown().markup(
    Markup.inlineKeyboard(buttons)
  ).inReplyTo(ctx.message.message_id)

  let text = '*Battlereport*'
  text += '\n'
  text += attack ? emoji.army : emoji.wall
  text += won ? '😏' : '😒'
  text += ' '
  text += formatNumberShort(reward, true) + emoji.gold

  const currentlyExisting = await battlereports.get(ctx.from.id, timestamp)
  const isNew = stringify(currentlyExisting) !== stringify(report)
  if (isNew) {
    text += '\nThanks for that. I added it 👌'
  } else {
    text += '\nYou have sent me this one already 🙃'
  }

  if (isNew) {
    await battlereports.add(ctx.from.id, timestamp, report, ctx.message.text)
  }
  return ctx.reply(text, extra)
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
