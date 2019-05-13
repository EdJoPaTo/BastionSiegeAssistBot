const Telegraf = require('telegraf')

const battlereports = require('../lib/data/battlereports')
const playerStatsDb = require('../lib/data/playerstats-db')
const userSessions = require('../lib/data/user-sessions')

const poweruser = require('../lib/data/poweruser')

const {getHoursEarlier, getMidnightXDaysEarlier} = require('../lib/math/unix-timestamp')

const {emoji} = require('../lib/user-interface/output-text')

const bot = new Telegraf.Composer()

bot.command('botstats', async ctx => {
  const allBattlereports = await battlereports.getAll()
  const enemies = playerStatsDb.list()
  const users = userSessions.getRaw().length
  const powerusers = poweruser.getPoweruserSessions().length

  const time24hAgo = getHoursEarlier(Date.now() / 1000, 24)
  const date30dAgo = getMidnightXDaysEarlier(Date.now() / 1000, 30)
  const reportsWithin24h = allBattlereports
    .filter(o => o.time > time24hAgo)
  const enemiesWithin30d = enemies
    .filter(o => o.lastBattleTime > date30dAgo)

  let text = `*${ctx.i18n.t('botstats.title')}*\n`

  text += `\n${ctx.i18n.t('battlereports')}: ${allBattlereports.length}${emoji.battlereport}`
  text += `\n  ${ctx.i18n.t('botstats.within24h')}: ${reportsWithin24h.length}${emoji.battlereport}`
  text += `\n${ctx.i18n.t('botstats.analysedPlayers')}: ${enemies.length}`
  text += `\n  ${ctx.i18n.t('botstats.within30d')}: ${enemiesWithin30d.length}`
  text += `\n${ctx.i18n.t('botstats.users')}: ${users} (${powerusers}${emoji.poweruser})`

  return ctx.replyWithMarkdown(text)
})

module.exports = {
  bot
}
