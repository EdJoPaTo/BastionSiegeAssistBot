const Telegraf = require('telegraf')

const battlereports = require('../lib/battlereports')

const {getMidnightXDaysEarlier} = require('../lib/number-functions')
const {createBattleStatsString} = require('../lib/create-stats-strings')

const bot = new Telegraf.Composer()

bot.command('battlestats', sendBattleStats)
bot.action('battlestats', sendBattleStats)

function sendBattleStats(ctx) {
  const allReportsOfMyself = battlereports.getAll()
    .filter(o => o.providingTgUser === ctx.from.id)
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
