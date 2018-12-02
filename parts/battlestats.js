const Telegraf = require('telegraf')
const stringify = require('json-stable-stringify')

const battlereports = require('../lib/battlereports')
const playerStats = require('../lib/player-stats')
const playerStatsSearch = require('../lib/player-stats-search')

const {emoji} = require('../lib/gamescreen.emoji')
const {formatNumberShort, getMidnightXDaysEarlier} = require('../lib/number-functions')
const {createBattleStatsString, createPlayerStatsString} = require('../lib/create-stats-strings')

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

  const allBattlereports = await battlereports.getAll()

  const buttons = [
    [
      Markup.callbackButton('Your Battle Stats', 'battlestats')
    ]
  ]
    .concat(
      report.enemies.map(
        o => Markup.switchToChatButton(`Share ${o}…`, o)
      ).map(o => [o])
    )
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

    if (!ctx.session.search) {
      ctx.session.search = {}
    }
    const me = report.friends[0] // Wrong for alliance battles but they are not considered here.
    const relevantDays = 2
    const minDate = getMidnightXDaysEarlier(Date.now() / 1000, relevantDays)
    const relevantReports = allBattlereports
      // Only solo battles are valued. Adding Alliance battles will end within the min(1)
      .filter(o => o.friends.length === 1)
      .filter(o => o.friends[0] === me)
      .filter(o => o.time > minDate)

    const reward = relevantReports.length / relevantDays / 5
    const rewardFinal = Math.min(1, Math.max(5, Math.round(reward)))
    ctx.session.search.remainingSearches = playerStatsSearch.newSearchLimitAfterReward(ctx.session.search.remainingSearches, rewardFinal)
  } else {
    text += '\nYou have sent me this one already 🙃'
  }

  text += '\n\n'
  text += report.enemies
    .map(o => playerStats.generate(allBattlereports, o))
    .map(o => createPlayerStatsString(allBattlereports, o))
    .join('\n\n')

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
