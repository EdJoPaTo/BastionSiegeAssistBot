import {Composer} from 'telegraf'

import * as messages from '../lib/data/ingame/messages'
import * as playerStatsDb from '../lib/data/playerstats-db'
import * as poweruser from '../lib/data/poweruser'
import * as userSessions from '../lib/data/user-sessions'

import {getHoursEarlier, getMidnightXDaysEarlier} from '../lib/math/unix-timestamp'

import {emoji} from '../lib/user-interface/output-text'

export const bot = new Composer()

bot.command('botstats', async (ctx: any) => {
  const allBattlereports = messages.battlereports.values()
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
