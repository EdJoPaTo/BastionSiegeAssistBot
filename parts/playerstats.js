const Telegraf = require('telegraf')

const battlereports = require('../lib/battlereports')
const playerStats = require('../lib/player-stats')
const playerStatsSearch = require('../lib/player-stats-search')

const {createPlayerStatsString} = require('../lib/create-stats-strings')

const {Extra, Markup} = Telegraf

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

async function sendPlayerStats(ctx, playername) {
  const canSearch = playerStatsSearch.canSearch(ctx.session.search)

  if (!canSearch) {
    let text = `You are a bad member of society ${ctx.from.first_name}!`
    text += '\nYou don\'t seem to help me by sending reports. 😔'
    text += '\n'
    text += '\nSend your battlereports to me. I will continue to support you then. 😎'
    text += '\nAs you are sending more reports, I will support you with less contrains ☺️'
    return ctx.replyWithMarkdown(text)
  }
  ctx.session.search = playerStatsSearch.applySearch(ctx.session.search)

  const allBattlereports = await battlereports.getAll()
  const stats = playerStats.generate(allBattlereports, playername)

  const buttons = [
    [
      Markup.switchToChatButton('Share Player Stats…', playername)
    ]
  ]

  return ctx.replyWithMarkdown(
    createPlayerStatsString(allBattlereports, stats),
    Extra.markup(Markup.inlineKeyboard(buttons))
  )
}

module.exports = {
  bot
}
