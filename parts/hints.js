const Telegraf = require('telegraf')

const poweruser = require('../lib/data/poweruser')

const bot = new Telegraf.Composer()

bot.on('text', async (ctx, next) => {
  if (!ctx.session.disableImmunity &&
    poweruser.isPoweruser(ctx.from.id) &&
    !ctx.session.gameInformation.player) {
    let text = 'You are a poweruser! 💙'
    text += '\n⚠️ I do not know your ingame name in order to make you immune. You can send your main screen or disable this in the /settings.'
    await ctx.replyWithMarkdown(text)
  }

  return next()
})

module.exports = {
  bot
}
