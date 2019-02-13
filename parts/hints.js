const Telegraf = require('telegraf')

const poweruser = require('../lib/data/poweruser')

const {emoji} = require('../lib/user-interface/output-text')

const bot = new Telegraf.Composer()

bot.on('text', async (ctx, next) => {
  if (!ctx.session.disableImmunity &&
    poweruser.isPoweruser(ctx.from.id) &&
    !ctx.session.gameInformation.player) {
    let text = ctx.i18n.t('poweruser.youare') + ' ' + emoji.poweruser
    text += '\n⚠️ ' + ctx.i18n.t('poweruser.getImmunity')
    await ctx.replyWithMarkdown(text)
  }

  return next()
})

module.exports = {
  bot
}
