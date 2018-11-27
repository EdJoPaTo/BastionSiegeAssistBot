const Telegraf = require('telegraf')

const battlereports = require('../lib/battlereports')
const playerStats = require('../lib/player-stats')

const {createPlayerStatsString} = require('../lib/create-stats-strings')

const bot = new Telegraf.Composer()

function isAttackIncoming(ctx) {
  return ctx.state.screen &&
         ctx.state.screen.information &&
         ctx.state.screen.information.attackincoming
}

bot.on('text', Telegraf.optional(isAttackIncoming, ctx => {
  const {attackincoming} = ctx.state.screen.information
  return sendPlayerStats(ctx, attackincoming.player)
}))

function isAttackScout(ctx) {
  return ctx.state.screen &&
         ctx.state.screen.information &&
         ctx.state.screen.information.attackscout
}

bot.on('text', Telegraf.optional(isAttackScout, ctx => {
  const {attackscout} = ctx.state.screen.information
  return sendPlayerStats(ctx, attackscout.player)
}))

bot.action(/player-(.+)/, ctx => {
  const playername = ctx.match[1]
  return sendPlayerStats(ctx, playername)
})

async function sendPlayerStats(ctx, playername) {
  const allBattlereports = await battlereports.getAll()
  const stats = playerStats.generate(allBattlereports, playername)

  return ctx.replyWithMarkdown(
    createPlayerStatsString(allBattlereports, stats)
  )
}

module.exports = {
  bot
}
