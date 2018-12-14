const Telegraf = require('telegraf')

const battlereports = require('../lib/data/battlereports')

const {getMidnightXDaysEarlier} = require('../lib/math/unix-timestamp')
const battleStats = require('../lib/math/battle-stats')

const {createBattleStatsString} = require('../lib/user-interface/battle-stats')

const bot = new Telegraf.Composer()

bot.command('battlestats', sendBattleStats)
bot.action('battlestats', sendBattleStats)

function sendBattleStats(ctx) {
  const allReportsOfMyself = battlereports.getAll()
    .filter(o => o.providingTgUser === ctx.from.id)
  const firstTimeRelevant = getMidnightXDaysEarlier(Date.now() / 1000, 7)
  const reportsFiltered = allReportsOfMyself
    .filter(report => report.time > firstTimeRelevant)

  const stats = battleStats.generate(reportsFiltered)

  let text = `*Battle Stats* of last 7d (${reportsFiltered.length})`
  text += '\n\n'
  text += createBattleStatsString(stats)

  return ctx.replyWithMarkdown(text)
}

module.exports = {
  bot
}
