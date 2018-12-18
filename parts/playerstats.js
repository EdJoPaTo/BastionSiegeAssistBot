const Telegraf = require('telegraf')

const battlereports = require('../lib/data/battlereports')

const playerStats = require('../lib/math/player-stats')

const {createPlayerStatsString} = require('../lib/user-interface/player-stats')

const {Extra, Markup} = Telegraf

const bot = new Telegraf.Composer()

function isAttackIncoming(ctx) {
  return ctx.state.screen &&
         ctx.state.screen.information &&
         ctx.state.screen.information.attackincoming
}

bot.on('text', Telegraf.optional(isAttackIncoming, ctx => {
  const {attackincoming} = ctx.state.screen.information
  const time = ctx.message.forward_date
  const minutesAgo = ((Date.now() / 1000) - time) / 60
  if (minutesAgo > 8) {
    let text = ''
    text += 'This battle is long over… Send me the report instead. 😉'
    return ctx.reply(text)
  }
  const {text, extra} = generatePlayerStats(attackincoming.player)
  return ctx.reply(text, extra)
}))

function isAttackScout(ctx) {
  return ctx.state.screen &&
         ctx.state.screen.information &&
         ctx.state.screen.information.attackscout
}

bot.on('text', Telegraf.optional(isAttackScout, ctx => {
  const {attackscout} = ctx.state.screen.information
  const time = ctx.message.forward_date
  const minutesAgo = ((Date.now() / 1000) - time) / 60
  if (minutesAgo > 2) {
    let text = ''
    text += 'Your scouts havn\'t been there for a long time.'
    text += ` I'll help you when you see ${attackscout.player} next time. 😊`
    return ctx.reply(text)
  }
  const {text, extra} = generatePlayerStats(attackscout.player)
  return ctx.reply(text, extra)
}))

function generatePlayerStats(playername) {
  const allBattlereports = battlereports.getAll()
  const stats = playerStats.generate(allBattlereports, playername)

  const buttons = [
    [
      Markup.switchToChatButton('Share Player Stats…', playername)
    ]
  ]

  return {
    text: createPlayerStatsString(stats),
    extra: Extra.markdown().markup(Markup.inlineKeyboard(buttons))
  }
}

module.exports = {
  bot
}
