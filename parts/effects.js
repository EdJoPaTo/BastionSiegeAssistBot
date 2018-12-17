const Telegraf = require('telegraf')

const bot = new Telegraf.Composer()

function isEffects(ctx) {
  return ctx.state.screen && ctx.state.screen.type === 'effects'
}

bot.on('text', Telegraf.optional(isEffects, ctx => {
  return ctx.reply('Updated your effects. 👌\nSee /upcoming or enable alerts in the /settings.')
}))

module.exports = {
  bot
}
