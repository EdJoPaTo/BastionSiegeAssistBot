const Telegraf = require('telegraf')

const bot = new Telegraf.Composer()

function isEffects(ctx) {
  return ctx.state.screen && ctx.state.screen.information && ctx.state.screen.information.effects
}

bot.on('text', Telegraf.optional(isEffects, ctx => {
  return ctx.reply(ctx.i18n.t('effects.updated'))
}))

module.exports = {
  bot
}
