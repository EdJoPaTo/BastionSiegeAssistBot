const Telegraf = require('telegraf')

const battlereports = require('../lib/battlereports')
const playerStats = require('../lib/player-stats')

const {getHoursEarlier} = require('../lib/number-functions')

const bot = new Telegraf.Composer()

bot.command('botstats', async ctx => {
  const allBattlereports = await battlereports.getAll()
  const {reports, enemies, immune} = playerStats.usageStats(allBattlereports)

  const minDate = getHoursEarlier(Date.now() / 1000, 24)
  const reportsWithin24h = reports
    .filter(o => o.time > minDate)

  let text = '*Statistics of the Bot*\n'

  text += `\nBattlereports: ${reports.length}`
  text += `\nBattlereports added within 24h: ${reportsWithin24h.length}`
  text += `\nAnalysed Players: ${enemies.length}`
  text += `\nCurrently Immune 🛡💙: ${immune.length}`

  return ctx.replyWithMarkdown(text)
})

module.exports = {
  bot
}
