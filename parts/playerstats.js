const Telegraf = require('telegraf')

const battlereports = require('../lib/battlereports')
const playerStats = require('../lib/player-stats')

const {createPlayerStatsString} = require('../lib/create-stats-strings')

const bot = new Telegraf.Composer()

function isAttackScout(ctx) {
  return ctx.state.screen &&
         ctx.state.screen.information &&
         ctx.state.screen.information.attackscout
}

bot.on('text', Telegraf.optional(isAttackScout, async ctx => {
  const {attackscout} = ctx.state.screen.information
  const allBattlereports = await battlereports.getAll()
  const stats = playerStats.generate(allBattlereports, attackscout.player)

  return ctx.replyWithMarkdown(
    createPlayerStatsString(allBattlereports, stats)
  )
}))

module.exports = {
  bot
}
