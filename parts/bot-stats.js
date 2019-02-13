const Telegraf = require('telegraf')

const battlereports = require('../lib/data/battlereports')
const playerStatsDb = require('../lib/data/playerstats-db')
const userSessions = require('../lib/data/user-sessions')

const poweruser = require('../lib/data/poweruser')

const {getHoursEarlier} = require('../lib/math/unix-timestamp')

const {emoji} = require('../lib/user-interface/output-text')

const bot = new Telegraf.Composer()

bot.command('botstats', async ctx => {
  const allBattlereports = await battlereports.getAll()
  const enemies = playerStatsDb.list()
  const users = userSessions.getRaw().length
  const powerusers = poweruser.getPoweruserSessions().length

  const minDate = getHoursEarlier(Date.now() / 1000, 24)
  const reportsWithin24h = allBattlereports
    .filter(o => o.time > minDate)

  let text = '*Statistics of the Bot*\n'

  text += `\nBattlereports: ${allBattlereports.length}${emoji.battlereport}`
  text += `\nBattlereports added within 24h: ${reportsWithin24h.length}${emoji.battlereport}`
  text += `\nAnalysed Players: ${enemies.length}`
  text += `\nUsers: ${users} (${powerusers} Powerusers${emoji.poweruser})`

  return ctx.replyWithMarkdown(text)
})

module.exports = {
  bot
}
